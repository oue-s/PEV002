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
@app.route("/register", methods=["GET", "POST"])
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

    return render_template("register.html")


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
@app.route("/unregister")
@login_required
def unregister():
    # ここにdisp.csvファイルを削除する機能を入れる
    current_user.delete_instance()
    logout_user()
    return redirect("/")


@app.route("/", methods=["GET", "POST"])
@login_required
def index():

    if request.method == "POST":
        try:
            # user = User.select().where(User.email == request.form["email"]).first()
            # postメソッドでユーザーから指定される
            # his_0_name = "earth_point"
            # his_1_name = "human_point"
            items = request.form.getlist("items")
            his_0_name = items[0]
            his_1_name = items[1]

            # ここはloginユーザー名をつけたい
            # disp_his_name = "disp_2"
            disp_his_name = f"disp_{current_user.name}"
            # postメソッド で時間軸変換を指定する
            # 現状 1 起点を揃える 2 起点と終点を揃える 3 起点を揃えて、傾きを変える
            # calc_method = 0
            calc_method = int(request.form["number"])
            # 予備の変数 現状slopeに使う
            a = 7
            # 指定の加工が施されたCSVファイルが作成される
            create_crrent_disp(his_0_name, his_1_name, disp_his_name, calc_method, a)
            return render_template("index.html")
        except IntegrityError as e:
            flash(f"{e}")

    return render_template("index.html")


@app.route("/select")
def select():
    # 前回入力値を保存する
    selected_items = request.form.getlist("items")
    session["selected_items"] = selected_items

    # selected_items = session.get("selected_items", [])
    return render_template("select.html", selected_items=selected_items)
    # return render_template("select.html")


if __name__ == "__main__":
    # 使用するポートを明示
    app.run(port=8000, debug=True)
