"""
🔌 BACKEND API GUIDE - BetAI Access Code System
Flask/Express Implementation Guide

Ce fichier contient des exemples pour implémenter les endpoints backend
qui communiquent avec Supabase pour gérer les codes d'accès.
"""

# ============================================================
# 1. EXPRESS.JS IMPLEMENTATION
# ============================================================

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuration Supabase (Backend)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Clé secrète côté serveur
);

// ============================================================
// ENDPOINT 1: Activation de Code
// ============================================================
app.post('/activate-code', async (req, res) => {
  try {
    const { code, userId } = req.body;
    const ipAddress = req.ip;

    // Validation
    if (!code || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Code et userId requis' 
      });
    }

    // Appeler la fonction Supabase
    const { data, error } = await supabase.rpc('activate_code_for_user', {
      p_code: code.trim().toUpperCase(),
      p_user_id: userId,
      p_ip_address: ipAddress
    });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    if (!data[0].success) {
      return res.status(400).json({ 
        success: false, 
        error: data[0].message 
      });
    }

    return res.json({
      success: true,
      message: data[0].message,
      plan: data[0].plan,
      expiresAt: data[0].expires_at
    });
  } catch (err) {
    console.error('Erreur activation code:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur' 
    });
  }
});

// ============================================================
// ENDPOINT 2: Renvoi du Code
// ============================================================
app.post('/api/resend_code', async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ 
        error: 'userId et email requis' 
      });
    }

    // Vérifier si l'utilisateur a activé un code
    const { data: activations } = await supabase
      .from('code_activations')
      .select('code_value, plan_activated, activated_at')
      .eq('user_id', userId)
      .order('activated_at', { ascending: false })
      .limit(1);

    if (!activations || activations.length === 0) {
      // Générer un nouveau code temporaire
      const tempCode = `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Envoyer par email (utiliser SendGrid, Mailgun, etc.)
      // await sendEmail(email, 'Code de Accès Temporaire', tempCode);
      
      return res.json({ 
        message: 'Code temporaire envoyé par email',
        code: tempCode // À supprimer en production
      });
    }

    return res.json({ 
      message: 'Votre code a été renvoyé par email',
      code: activations[0].code_value // À supprimer en production
    });
  } catch (err) {
    console.error('Erreur renvoi code:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// ENDPOINT 3: Vérifier l'Authentification
// ============================================================
app.get('/check-auth', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        authenticated: false, 
        error: 'Token manquant' 
      });
    }

    // Vérifier le token avec Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        authenticated: false, 
        error: 'Token invalide' 
      });
    }

    // Récupérer le plan de l'utilisateur
    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('plan, is_active, expires_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1);

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        plan: subscriptions?.[0]?.plan || 'free',
        isPremium: subscriptions && subscriptions.length > 0,
        expiresAt: subscriptions?.[0]?.expires_at
      }
    });
  } catch (err) {
    console.error('Erreur check-auth:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// ENDPOINT 4: Admin - Lister les Codes
// ============================================================
app.get('/admin/codes', authenticateAdmin, async (req, res) => {
  try {
    const { used, plan } = req.query;

    let query = supabase.from('access_codes').select('*');
    
    if (used !== undefined) {
      query = query.eq('is_used', used === 'true');
    }
    
    if (plan) {
      query = query.eq('plan', plan);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({
      total: data.length,
      codes: data
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ENDPOINT 5: Admin - Créer des Codes
// ============================================================
app.post('/admin/create-codes', authenticateAdmin, async (req, res) => {
  try {
    const { count, plan } = req.body;

    if (!count || !plan) {
      return res.status(400).json({ 
        error: 'count et plan requis' 
      });
    }

    const codes = [];
    const PLANS = {
      starter: {
        duration: '1_month',
        features: ['basic_analysis', '5_predictions']
      },
      pro: {
        duration: '3_months',
        features: ['advanced_analysis', 'unlimited_predictions', 'strategy_simulator']
      },
      expert: {
        duration: '1_year',
        features: ['all_features', 'api_access', 'dedicated_support']
      }
    };

    for (let i = 0; i < count; i++) {
      const randomCode = `BETAI-${plan.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const planConfig = PLANS[plan];
      
      codes.push({
        code: randomCode,
        plan: plan,
        duration: planConfig.duration,
        features: planConfig.features,
        is_active: true,
        is_used: false
      });
    }

    const { data, error } = await supabase
      .from('access_codes')
      .insert(codes);

    if (error) throw error;

    return res.json({
      success: true,
      message: `${count} code(s) créé(s)`,
      codes: data
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================
// MIDDLEWARE: Authentication Admin
// ============================================================
async function authenticateAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    // Vérifier si l'utilisateur est admin
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    // Vérifier le rôle admin (à implémenter selon votre système)
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});


# ============================================================
# 2. FLASK IMPLEMENTATION (Python)
# ============================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from supabase import create_client, Client
import datetime
import random
import string

app = Flask(__name__)
CORS(app)

# Configuration Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# ============================================================
# ENDPOINT 1: Activation de Code
# ============================================================
@app.route('/activate-code', methods=['POST'])
def activate_code():
    try:
        data = request.get_json()
        code = data.get('code')
        user_id = data.get('userId')
        ip_address = request.remote_addr

        if not code or not user_id:
            return jsonify({'success': False, 'error': 'Code et userId requis'}), 400

        # Appeler la fonction Supabase
        response = supabase.rpc('activate_code_for_user', {
            'p_code': code.strip().upper(),
            'p_user_id': user_id,
            'p_ip_address': ip_address
        }).execute()

        if response.data and response.data[0]['success']:
            return jsonify({
                'success': True,
                'message': response.data[0]['message'],
                'plan': response.data[0]['plan'],
                'expiresAt': response.data[0]['expires_at']
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': response.data[0]['message'] if response.data else 'Erreur inconnue'
            }), 400
    
    except Exception as e:
        print(f'Erreur activation code: {str(e)}')
        return jsonify({'success': False, 'error': 'Erreur serveur'}), 500

# ============================================================
# ENDPOINT 2: Renvoi du Code
# ============================================================
@app.route('/api/resend_code', methods=['POST'])
def resend_code():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        email = data.get('email')

        if not user_id or not email:
            return jsonify({'error': 'userId et email requis'}), 400

        # Chercher la dernière activation
        result = supabase.table('code_activations') \
            .select('code_value, plan_activated, activated_at') \
            .eq('user_id', user_id) \
            .order('activated_at', desc=True) \
            .limit(1) \
            .execute()

        if result.data and len(result.data) > 0:
            code = result.data[0]['code_value']
            # Envoyer par email
            # send_email(email, 'Votre code d\'accès', code)
            return jsonify({'message': 'Code envoyé par email', 'code': code}), 200
        else:
            return jsonify({'message': 'Aucun code trouvé pour cet utilisateur'}), 404

    except Exception as e:
        print(f'Erreur resend_code: {str(e)}')
        return jsonify({'error': 'Erreur serveur'}), 500

# ============================================================
# ENDPOINT 3: Check Auth
# ============================================================
@app.route('/check-auth', methods=['GET'])
def check_auth():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'authenticated': False, 'error': 'Token manquant'}), 401

        token = auth_header.split(' ')[1]

        # Vérifier le token
        response = supabase.auth.get_user(token)

        if response.user:
            # Récupérer le plan
            subscriptions = supabase.table('user_subscriptions') \
                .select('plan, is_active, expires_at') \
                .eq('user_id', response.user.id) \
                .eq('is_active', True) \
                .limit(1) \
                .execute()

            return jsonify({
                'authenticated': True,
                'user': {
                    'id': response.user.id,
                    'email': response.user.email,
                    'plan': subscriptions.data[0]['plan'] if subscriptions.data else 'free',
                    'isPremium': len(subscriptions.data) > 0,
                    'expiresAt': subscriptions.data[0]['expires_at'] if subscriptions.data else None
                }
            }), 200
        else:
            return jsonify({'authenticated': False, 'error': 'Token invalide'}), 401

    except Exception as e:
        print(f'Erreur check_auth: {str(e)}')
        return jsonify({'error': 'Erreur serveur'}), 500

# ============================================================
# START SERVER
# ============================================================
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)


# ============================================================
# 3. ENVIRONMENT VARIABLES (.env backend)
# ============================================================

SUPABASE_URL=https://ojmlumtihoxmhvnufkqh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_secret_key_here_never_share
PORT=5000
NODE_ENV=development

# Email Service (optional)
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@betai.app

# ============================================================
# 4. DEPENDENCIES
# ============================================================

# Express.js + Node.js
npm install express cors dotenv @supabase/supabase-js

# Flask + Python
pip install flask flask-cors python-dotenv supabase


# ============================================================
# 5. TESTING
# ============================================================

# Test avec cURL
curl -X POST http://localhost:5000/activate-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BETAI-STARTER-001",
    "userId": "user-uuid-here"
  }'

# Réponse attendue:
# {
#   "success": true,
#   "message": "Code activé avec succès",
#   "plan": "starter",
#   "expiresAt": "2024-07-20T12:00:00Z"
# }
