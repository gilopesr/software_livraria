from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from config import db
from cliente.clienteModel import Cliente

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        senha = request.form.get("password")

        cliente = Cliente.query.filter_by(username=username, senha=senha).first()
        if cliente:
            # Salva o nome do cliente na sessão
            session['nome_cliente'] = cliente.username

            flash(f"Bem-vindo, {cliente.username}!", "sucesso")
            # Redireciona para a página inicial de livros (ajuste se necessário)
            return redirect(url_for("livro.index"))
        else:
            flash("Usuário ou senha incorretos!", "erro")
            return redirect(url_for("auth_bp.login"))
    
    return render_template("login.html")


# Logout deve ficar fora da função login
@auth_bp.route("/logout")
def logout():
    session.pop('nome_cliente', None)
    flash("Você saiu da sua conta.", "sucesso")
    return redirect(url_for("auth_bp.login"))

