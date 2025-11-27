from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from config import db
from cliente.clienteModel import Cliente
from werkzeug.security import check_password_hash
import os

auth_bp = Blueprint("auth_bp", __name__)
hash_admin='pbkdf2:sha256:6000000$pZdtIpYfkJxKyAeX$8898d92e3c84dbce3fb4f1def449f0c4dd0d088f76033d3dc8efa2c897b1f8d4'
admin_passw = os.environ.get('admin_passw',hash_admin)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        senha = request.form.get('password')
        userDb = Cliente.query.filter_by(username=username).first() # Para buscar o username no banco
        next_page = request.args.get('next')

        if username == 'admin' and check_password_hash(admin_passw, senha):
            session['logged_in'] = True
            session['username'] = username
            session['is_admin'] = True

            flash('Login de administrador realizado com sucesso!!✅')
            if next_page:
                return redirect(next_page)
            else:
                return redirect(url_for('home')) 
        
        elif userDb and check_password_hash(userDb.senha, senha):
            session['logged_in'] = True
            session['username'] = userDb.username
            session['id_cliente'] = userDb.id
            session['is_admin'] = False
            flash('Login de usuário feito com sucesso!✅')

            if next_page:
                return redirect(next_page)
            else:
               return redirect(url_for('home'))
        else:
            flash("❌nome de usuário ou senha inválidos!!❌")
            return render_template('login.html')
    
    return render_template("login.html")


# Logout deve ficar fora da função login
@auth_bp.route("/logout")
def logout():
    session.clear()
    flash("Você saiu da sua conta.", "sucesso")
    return redirect(url_for("auth_bp.login"))


@auth_bp.route('/status_login', methods=['GET'])
def status_login():
    """
    Retorna o status de autenticação do usuário.
    Usa 'nome_cliente' na sessão como indicador de login.
    """
    if session.get('logged_in'):
        return jsonify({
            'logged_in':True,
            'username': session.get('username'),
            'id_cliente':session.get('id_cliente'),
            'is_admin':session.get('is_admin',False)
            
        }), 200
    else:
        return jsonify({
            'logged_in': False
        }), 200