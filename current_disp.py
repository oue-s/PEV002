import csv


def year_max_min(his_list):
    his_year_max = float(his_list[1][0])
    his_year_min = float(his_list[1][0])
    for i in range(1, len(his_list)):
        if float(his_list[i][0]) > his_year_max:
            his_year_max = float(his_list[i][0])
        if float(his_list[i][0]) < his_year_min:
            his_year_min = float(his_list[i][0])

    return his_year_max, his_year_min


def point_start(his_list, diff):
    for i in range(1, len(his_list)):
        num = float(his_list[i][0])
        num -= diff
        his_list[i][0] = num

    return his_list


def point_start_slope(his_list, slope, offset, diff):
    for i in range(1, len(his_list)):
        num = float(his_list[i][0])
        num = (num - offset) * slope + offset - diff
        his_list[i][0] = num

    return his_list


def year_int(his_list):
    for i in range(1, len(his_list)):
        num = his_list[i][0]
        his_list[i][0] = int(num)

    return his_list


def sum_list(his_list_a, his_list_b):
    for i in range(1, len(his_list_b)):
        his_list_a.append(his_list_b[i])

    return his_list_a


def create_crrent_disp(his_0_name, his_1_name, disp_his_name, calc_method, a):
    # 選択された歴史ファイルを指定(実際にはメインから指定される)
    # his_0_name = "data_earth"
    # his_1_name = "data_human"
    print(f"db_csv/{his_0_name}.csv")
    with open(f"db_csv/{his_0_name}.csv", "r", encoding="utf-8") as his_0_csv:
        reader = csv.reader(his_0_csv)
        his_0_list = [row for row in reader]
        print(his_0_list)

    with open(f"db_csv/{his_1_name}.csv", "r", encoding="utf-8") as his_1_csv:
        reader = csv.reader(his_1_csv)
        his_1_list = [row for row in reader]
        print(his_1_list)

    # 基本情報取り出し
    his_0_startYear_max, his_0_startYear_min = year_max_min(his_0_list)
    his_1_startYear_max, his_1_startYear_min = year_max_min(his_1_list)
    diff_1_0 = his_1_startYear_min - his_0_startYear_min

    if calc_method == 1:
        # 起点を揃える
        his_1_list = point_start(his_1_list, diff_1_0)
    elif calc_method == 2:
        # 起点と終点を揃える
        slope = (his_0_startYear_max - his_0_startYear_min) / (his_1_startYear_max - his_1_startYear_min)
        his_1_list = point_start_slope(his_1_list, slope, his_1_startYear_min, diff_1_0)
    elif calc_method == 3:
        # 起点を揃えて、傾きを変える
        slope = 2
        his_1_list = point_start_slope(his_1_list, slope, his_1_startYear_min, diff_1_0)

    # yearをint型に変換
    his_1_list = year_int(his_1_list)

    # his_listを合体
    his_sum_list = sum_list(his_0_list, his_1_list)

    # 表示する歴史ファイルを作成される(実際にはユーザー毎に名前が指定される)
    # disp_his_name = "disp_1"
    with open(f"static/data/{disp_his_name}.csv", "w", encoding="utf-8", newline="") as disp_csv:
        writer = csv.writer(disp_csv)
        writer.writerows(his_sum_list)


if __name__ == "__main__":

    # デバグ用単独に動かす
    his_0_name = "ieyasu"
    his_1_name = "nobunaga"
    # ここはloginユーザー名をつけたい
    disp_his_name = "disp_guest_01"
    # 指定の加工が施されたCSVファイルが作成される
    calc_method = 0
    a = 1
    create_crrent_disp(his_0_name, his_1_name, disp_his_name, calc_method, a)
