from flask import Flask, flash, redirect, render_template, request, session
from current_disp import create_crrent_disp
from flask_login import LoginManager, current_user, login_required, login_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from peewee import IntegrityError
from db_config import User
import os


app = Flask(__name__)
app.secret_key = "secret"
login_manager = LoginManager()
login_manager.init_app(app)


# Flask-Loginがユーザー情報を取得するためのメソッド
@login_manager.user_loader
def load_user(user_id):
    return User.get_by_id(user_id)


# ログインしていないとアクセスできないページにアクセスがあった場合の処理
@login_manager.unauthorized_handler
def unauthorized_handler():
    return redirect("/login")


# ユーザー登録フォームの表示・登録処理
@app.route("/register_k29kc83kf71k", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        # データの検証
        if not request.form["name"] or not request.form["password"] or not request.form["email"]:
            flash("未入力の項目があります。")
            return redirect(request.url)
        if User.select().where(User.name == request.form["name"]):
            flash("その名前はすでに使われています。")
            return redirect(request.url)
        if User.select().where(User.email == request.form["email"]):
            flash("そのメールアドレスはすでに使われています。")
            return redirect(request.url)

        # ユーザー登録
        User.create(
            name=request.form["name"],
            email=request.form["email"],
            password=generate_password_hash(request.form["password"]),
        )
        return render_template("index.html")

    return render_template("register_k29kc83kf71k.html")


# ログインフォームの表示・ログイン処理
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # データの検証
        if not request.form["password"] or not request.form["email"]:
            flash("未入力の項目があります。")
            return redirect(request.url)

        # ここでユーザーを認証し、OKならログインする
        user = User.select().where(User.email == request.form["email"]).first()
        if user is not None and check_password_hash(user.password, request.form["password"]):
            login_user(user)
            # flash(f"ようこそ！ {user.name} さん")
            return redirect("/")

        # NGならフラッシュメッセージを設定
        flash("認証に失敗しました")

    return render_template("login.html")


# ログアウト処理
@app.route("/logout")
@login_required
def logout():

    # ユーザが表示のために生成したファイルを削除する
    if os.path.exists(f"static/data/disp_{current_user.name}.csv"):
        os.remove(f"static/data/disp_{current_user.name}.csv")

    logout_user()
    flash("ログアウトしました！")
    return redirect("/")


# ユーザー削除処理
@app.route("/unregister_hey2kdibyek33kfu")
@login_required
def unregister():

    current_user.delete_instance()
    logout_user()
    return redirect("/")


@app.route("/", methods=["GET", "POST"])
@login_required
def index():

    if request.method == "POST":
        try:
            # selectのpostメソッドのitemsから表示したい歴史のCSVファイル名
            # selectからのpostの形式が未定なので、ひとまずXとしてcurrent_dispに送る
            itemsX = request.form.getlist("items")
            # flask-loginのnameメソッドより現在のユーザーを特定
            disp_his_name = f"disp_{current_user.name}"
            # lectのpostメソッドのnumberから演算処理No
            calc_method = int(request.form["number"])
            # 軸変換に必要なパラメータがテキストとして送られてくる
            calc_option = request.form["option"]
            # 指定の加工が施されたCSVファイルが作成される
            num_his = create_crrent_disp(itemsX, disp_his_name, calc_method, calc_option)

            return render_template("index.html", num_his=num_his, calc_option=calc_option)
        except IntegrityError as e:
            flash(f"{e}")

    return render_template("index.html")


@app.route("/select")
def select():
    # 前回入力値を保存する
    selected_items = request.form.getlist("items")
    session["selected_items"] = selected_items

    return render_template("select.html", selected_items=selected_items)


@app.route("/select_test")
def select_test():
    # 前回入力値を保存する
    selected_items = request.form.getlist("items")
    session["selected_items"] = selected_items

    return render_template("select_test.html", selected_items=selected_items)


if __name__ == "__main__":
    # 使用するポートを明示
    app.run(port=8000, debug=True)
