import os
from config import app,db
from livro import livroRoutes

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host=app.config["HOST"], port=app.config['PORT'], debug=app.config['DEBUG'])