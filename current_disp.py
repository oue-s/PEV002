import csv
import json

# CSVファイルを3次元配列配列で読み込む仕様
# 0:CSVファイルNo 1:行(row) 2:列(column)
# カラム名など関係ない行とcolumnをここで一括管理 後で変更になったときにここをかえる

ROW_D = 1  # Data開始行
COL_SY = 0  # startYear列
COL_EY = 3  # endYear列


def year_max(his_list):
    iCsv = len(his_list)
    his_startYear_max = []
    for i in range(iCsv):
        year_max = float(his_list[i][ROW_D][COL_SY])
        for j in range(ROW_D + 1, len(his_list[i])):
            if float(his_list[i][j][COL_SY]) > year_max:
                year_max = float(his_list[i][j][COL_SY])

        his_startYear_max.append(year_max)

    return his_startYear_max


def year_min(his_list):
    iCsv = len(his_list)
    his_startYear_min = []
    for i in range(iCsv):
        year_min = float(his_list[i][ROW_D][COL_SY])
        for j in range(ROW_D + 1, len(his_list[i])):
            if float(his_list[i][j][COL_SY]) < year_min:
                year_min = float(his_list[i][j][COL_SY])

        his_startYear_min.append(year_min)

    return his_startYear_min


def year_diff(his_startYear_max, his_startYear_min):
    iCsv = len(his_startYear_max)
    diff_startyear = []
    for i in range(iCsv):
        diff_startyear.append(his_startYear_min[i] - his_startYear_min[0])

    return diff_startyear


def point_start(his_list, diff_startyear):
    iCsv = len(his_list)
    for i in range(1, iCsv):
        jCsv = len(his_list[i])
        for j in range(ROW_D, jCsv):
            year = float(his_list[i][j][COL_SY])
            year -= diff_startyear[i]
            his_list[i][j][COL_SY] = year

            # 期間ありアイテム(endyearあり)
            if his_list[i][j][COL_EY] != "":
                year = float(his_list[i][j][COL_EY])
                year -= diff_startyear[i]
                his_list[i][j][COL_EY] = year

    return his_list


def point_start_slope(his_list, slope, offset, diff):
    iCsv = len(his_list)
    for i in range(1, iCsv):
        jCsv = len(his_list[i])
        for j in range(ROW_D, jCsv):
            year = float(his_list[i][j][COL_SY])
            year = (year - offset[i]) * slope + offset[i] - diff[i]
            his_list[i][j][COL_SY] = year

            # 期間ありアイテム(endyearあり)
            if his_list[i][j][COL_EY] != "":
                year = float(his_list[i][j][COL_EY])
                year = (year - offset[i]) * slope + offset[i] - diff[i]
                his_list[i][j][COL_EY] = year

    return his_list


def point_start_end(his_list, his_startYear_max, his_startYear_min, diff_startyear):
    iCsv = len(his_list)
    for i in range(1, iCsv):
        jCsv = len(his_list[i])
        slope = (his_startYear_max[0] - his_startYear_min[0]) / (his_startYear_max[i] - his_startYear_min[i])
        offset = his_startYear_min[i]
        diff = diff_startyear[i]
        for j in range(ROW_D, jCsv):
            year = float(his_list[i][j][COL_SY])
            year = (year - offset) * slope + offset - diff
            his_list[i][j][COL_SY] = year

            # 期間ありアイテム(endyearあり)
            if his_list[i][j][COL_EY] != "":
                year = float(his_list[i][j][COL_EY])
                year = (year - offset) * slope + offset - diff
                his_list[i][j][COL_EY] = year

    return his_list


def year_int(his_list):
    iCsv = len(his_list)
    for i in range(iCsv):
        jCsv = len(his_list[i])
        for j in range(ROW_D, jCsv):
            year = his_list[i][j][COL_SY]
            his_list[i][j][COL_SY] = int(year)

            # 期間ありアイテム(endyearあり)
            if his_list[i][j][COL_EY] != "":
                year = his_list[i][j][COL_EY]
                his_list[i][j][COL_EY] = int(year)

    return his_list


def sum_list(his_list):
    iCsv = len(his_list)
    his_sum_list = []
    for i in range(iCsv):
        jCsv = len(his_list[i])
        for j in range(jCsv):
            # 0番目以外はヘッダーを取り除きたいので
            if i != 0 and j < ROW_D:
                continue

            his_sum_list.append(his_list[i][j])

    return his_sum_list


# メインルーチン
def create_crrent_disp(itemsX, disp_his_name, calc_method, a):
    # items の中身チェック(ネストリストの形対応)
    print("0", itemsX, len(itemsX))
    items = []
    if len(itemsX) == 0:
        # これは[]なのでダミーをいれる
        print("case1")
        items.append("dummy_1")
    elif len(itemsX) == 1:
        # これは[item1]か['Json文字']か[''](空選択)なので入れ子を外してダミーを知れる
        try:
            items = json.loads(itemsX[0])
            print("case2")
        except json.JSONDecodeError as e:
            print(itemsX[0], type(itemsX[0]))
            if itemsX[0] == "":
                # これは['']の場合
                items.append("dummy_1")
                print("case5", e)
            else:
                items.append(itemsX[0])
                print("case3", e)
    else:
        print("case4")
        items = itemsX

    print("1", items, type(items))

    # itemsで指定されたCSVファイルの数を確認して3次元配列に収納する
    iCsv = len(items)
    his_list = [[]] * iCsv
    print(items)
    for i in range(iCsv):
        # Flask単体で動かす場合は相対パス　Apacheで動かす場合は相対パス
        # 絶対パスの場合、ユーザー名やプロジェクト名(ディレクトリ名に注意)
        # with open(f"/home/@/@/db_csv/{items[i]}.csv", "r", encoding="utf-8") as his_csv:
        with open(f"db_csv/{items[i]}.csv", "r", encoding="utf-8") as his_csv:
            reader = csv.reader(his_csv)
            his_list[i] = [row for row in reader]

    # 基本情報取り出し
    his_startYear_max = []
    his_startYear_min = []
    diff_startyear = []
    his_startYear_max = year_max(his_list)
    his_startYear_min = year_min(his_list)
    diff_startyear = year_diff(his_startYear_max, his_startYear_min)

    # print(his_startYear_max, his_startYear_min, diff_startyear)

    if calc_method == 1:
        # 起点を揃える
        his_list = point_start(his_list, diff_startyear)
    elif calc_method == 2:
        # 起点と終点を揃える
        his_list = point_start_end(his_list, his_startYear_max, his_startYear_min, diff_startyear)
    elif calc_method == 3:
        # 起点を揃えて、傾きを変える
        slope = 2
        his_list = point_start_slope(his_list, slope, his_startYear_min, diff_startyear)

    # yearをint型に変換
    his_list = year_int(his_list)

    # his_listを合体
    his_sum_list = sum_list(his_list)

    # 表示する歴史ファイルを作成される(実際にはユーザー毎に名前が指定される)
    # Flask単体で動かす場合は相対パス　Apacheで動かす場合は相対パス
    # 絶対パスの場合、ユーザー名やプロジェクト名(ディレクトリ名に注意)
    # with open(f"/home/@/@/static/data/{disp_his_name}.csv", "w", encoding="utf-8", newline="") as disp_csv:
    with open(f"static/data/{disp_his_name}.csv", "w", encoding="utf-8", newline="") as disp_csv:
        writer = csv.writer(disp_csv)
        writer.writerows(his_sum_list)

    # 描画に必要な領域計算のため、表示するhisの個数を返す
    return len(items)


if __name__ == "__main__":

    # デバグ用単独に動かす このファイルを開いた状態で▶(run)で確認できる
    items = ["ieyasu", "nobunaga", "hachimantai"]
    disp_his_name = "disp_localTest"
    # 指定の加工が施されたCSVファイルが作成される
    calc_method = 2
    a = 1
    create_crrent_disp(items, disp_his_name, calc_method, a)
