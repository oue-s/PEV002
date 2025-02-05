// サイズとマージンの設定
const margin = { top: 30, right: 20, bottom: 20, left: 150 }; // SVG全体のマージン
const width = 960;//有効描画範囲の横幅
const height1 = 15;//最上部表示レーンの高さ 期間ありイベントのtext
const height2 = 15;//最上部表示レーンの高さ 期間ありイベント
const eventOffset = 15;//通常表示レーンの高さ
const numEvent = 4;//通常表示レーンの数
const height3 = 15;//最下部表示レーンの高さ 引用text
const groupHeigt = height1 + height2 + eventOffset * numEvent + height3;//一つのグループの高さ
let numberHis = Number(numHis) //app.pyより選択されたアイテムの数をもらってくる
const height = groupHeigt * numberHis;//有効描画範囲の高さ

const modifyAxisUpper = -20

const modifyImageXoffset = -75
const widthImage = 80;
const heightImage = 80;

const heightRectEvent = 10;

const modifyEventXoffset = -6; //文字の・が時間軸と一致するように微調整
const modifyEventYoffset = 0;
const modifyTextYoffset = 12; //textオブジェクトのY軸起点がテキストの中央になっているための補正

const modifyImageCitationXoffset = -75;


const marginXupper = 0;

// デバグ用　変数が来ていることの確認 
// document.write(numHis)

let showImages = false;
d3.select("#image-toggle").on("change", function() {
    showImages = this.checked;  // チェックボックスの状態でフラグを更新
    render();
});

// SVGの作成
const svg = d3.select(".chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// スケールの設定
const x = d3.scaleLinear().domain([-1e8, new Date().getFullYear()]).range([0, width]);
const y = d3.scaleBand().range([0, height]);

// 年の表記を指数に
const formatYear = d3.format("d");
const xAxis = d3.axisBottom(x).tickFormat(d => {
    if (d < -9999 || d > 9999) {
        return d3.format(".0e")(d);
    }
    return formatYear(d);
});

// CSVファイルの読み込み
d3.csv(currentUser).then(data => {
    // データのパース
    data.forEach(d => {
        d.startYear = +d.startYear;
        d.endYear = d.endYear ? +d.endYear : d.startYear;
        // d.imageCitation = d.imageCitation
    });

    // グループ化
    const groups = Array.from(new Set(data.map(d => d.group)));
    // const groupScale = d3.scaleBand().domain(groups).range([marginXupper, height]);
    const groupScale = d3.scaleBand().domain(groups).range([0,height]);
    // スケールのドメイン設定
    x.domain(d3.extent(data, d => d.startYear));

    // 軸の追加
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        // .call(xAxis);

        .call(
            xAxis
                .tickSize(-height)
                .tickSizeOuter(0)
            )
        .selectAll("line")  // すべての目盛り線に適用
        .attr("stroke-dasharray", "4 2","red");// 点線のパターン;

    // 軸の追加(上)
    svg.append("g")
        .attr("class", "x axis_upper")
        .attr("transform", `translate(0,${modifyAxisUpper})`)
        .call(xAxis);

    // グループの間に線を引く
    svg.selectAll(".group-line")
        .data(groups)
        .enter()
        .append("line")
        .attr("class", "group-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => groupScale(d) + groupScale.bandwidth())
        .attr("y2", d => groupScale(d) + groupScale.bandwidth())
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);

    // グループタイトルの追加
    const groupTitles = groups.map(group => {
        const groupData = data.find(d => d.group === group);
        return { group: group, title: groupData.groupTitle};
    });

    svg.selectAll(".group-title")
        .data(groupTitles)
        .enter()
        .append("text")
        .attr("class", "group-title")
        .attr("x", -margin.left + 10)
        .attr("y", d => groupScale(d.group) + groupScale.bandwidth() / 2)
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .style("font-size","20px")
        //.style("fill","red")
        .text(d => d.title)

    // SVG領域全体でズームとパンを有効にするためのダミーオブジェクト
    svg.append("rect",":first-child")
        .attr("class", "background-rect") // 任意のクラスを設定
        .attr("x", 0)                     // 矩形のX位置
        .attr("y", 0)                     // 矩形のY位置
        .attr("width", width)          // 矩形の幅
        .attr("height", height)           // SVGの高さに合わせた矩形の高さ
        .style("fill", "gray")       // 矩形の色 (任意)
        .style("opacity",0)           // 矩形の透明度 (任意)
        .style("pointer-events", "all");
         
    // データの描画関数
    function render() {

        // イベント画像の描画
        const images = svg.selectAll("image")
            // .data(data.filter(d => d.image), d => d.event);
            .data(showImages ? data.filter(d => d.image) : [], d => d.event);

        images.enter().append("image")

            .merge(images)
            .attr("x", d => d.startYear === d.endYear ? x(d.startYear) + modifyImageXoffset  : (x(d.startYear) + x(d.endYear)) / 2)
            .attr("y", d => groupScale(d.group) + height1)
            .attr("width", widthImage)
            .attr("height", heightImage)
            .attr("xlink:href", d => d.image);

        images.exit().remove();



        // 期間イベントの描画
        const rects = svg.selectAll("rect.event")
            .data(data.filter(d => d.startYear !== d.endYear), d => d.event);

        rects.enter().append("rect")
            .attr("class", d => `event event-group-${d.group}`)
            .merge(rects)
            .attr("x", d => x(d.startYear))
            .attr("y", d => groupScale(d.group) + height1)
            .attr("width", d => x(d.endYear) - x(d.startYear))
            .attr("height", heightRectEvent)
            .attr("fill", d => d.eventColor);

        rects.exit().remove();

        // 期間を持たないイベントの描画
        // const circles = svg.selectAll("circle")
        //     .data(data.filter(d => d.startYear === d.endYear), d => d.event);

        // circles.enter().append("circle")
        //     .attr("class", d => `event event-group-${d.group}`)
        //     .merge(circles)
        //     .attr("cx", d => x(d.startYear))
        //     // .attr("cy", d => groupScale(d.group) + (groupScale.bandwidth() / 4))
        //     .attr("cy", (d,i) => groupScale(d.group) + (eventOffset * 2)  + (i % numEvent * eventOffset))
        //     .attr("r", 2)
        //     .attr("fill", d => d.eventColor);

        // circles.exit().remove();

        // イベントラベルの描画
        const labels = svg.selectAll(".event-label")
            .data(data, d => d.event);

        labels.enter().append("text")
            .attr("class", d => `event-label event-group-${d.group}`)
            .merge(labels)
            .attr("x", d => d.startYear === d.endYear ? x(d.startYear) + modifyEventXoffset : (x(d.startYear) + x(d.endYear)) / 2)
            .attr("y", (d,i) => d.startYear === d.endYear ? (groupScale(d.group) + modifyTextYoffset + (height1 + height2) + (i % numEvent * eventOffset) + modifyEventYoffset) : (groupScale(d.group) + modifyTextYoffset))
            .attr("text-anchor", d => d.startYear === d.endYear ? "" :"middle")
            .text(d => d.startYear === d.endYear ? `・${d.event}`:d.event)

        labels.exit().remove();

        // イベント画像引用の描画
        const citations = svg.selectAll(".imageCitation")
            //.data(data.filter(d => d.imageCitation), d => d.event);
            .data(showImages ? data.filter(d => d.imageCitation) : [], d => d.event);

        citations.enter().append("text")
            .attr("class", d => `imageCitation event-group-${d.group}`)
            .merge(citations)
            .attr("x", d => x(d.startYear) + modifyImageCitationXoffset)
            .attr("y", d => (groupScale(d.group) + modifyTextYoffset + height1 + height2 + eventOffset*numEvent))
            // .attr("text-anchor", "start")
            .text(d => d.imageCitation)
            .style("font-size","8px")
            .style("fill","gray")

        citations.exit().remove();

    }

    // ズームとパンの設定
    const zoom = d3.zoom()
        .scaleExtent([0.1, 5000]) // 拡大縮小の範囲を設定
        .on("zoom", zoomed);

    svg.call(zoom);

    // ズーム状態を保持する変数
    let currentTransform = d3.zoomIdentity;

    // デバク用 zoomにより連続的に変化する変数を表示する位置
    const scaleText = svg.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", "black")
        .style("font-size", "16px");

    function zoomed(event) {
        currentTransform = event.transform; // 現在のズーム状態を記録

        //デバク用 検証->コンソールに変数値を表示
        console.log(currentTransform.k);
        //デバグ用 SVG内に変数値を表示する
        scaleText.text(`Zoom Scale in SVG: ${currentTransform.k.toFixed(2)}`);

        const newX = event.transform.rescaleX(x);
        xAxis.scale(newX);
        svg.select(".x.axis").call(xAxis.tickSize(-height).tickSizeOuter(0))
            .selectAll("line") // すべての目盛り線に適用
            .attr("stroke-dasharray", "4 2","red");// 点線のパターン;
        svg.select(".x.axis_upper").call(xAxis);
        svg.selectAll("rect.event")
            .attr("x", d => newX(d.startYear))
            .attr("width", d => newX(d.endYear) - newX(d.startYear))
            .style("display", d => (newX(d.endYear) < 0 || newX(d.startYear) > width) ? "none" : null);
        svg.selectAll("circle")
            .attr("cx", d => newX(d.startYear))
            .style("display", d => (newX(d.startYear) < 0 || newX(d.startYear) > width) ? "none" : null);
        svg.selectAll(".event-label")
            .attr("x", d => d.startYear === d.endYear ? newX(d.startYear) + modifyEventXoffset : (newX(d.startYear) + newX(d.endYear)) / 2)
            .style("display", d => (newX(d.endYear) < 0 || newX(d.startYear) > width) ? "none" : null);
        svg.selectAll("image")
            .attr("x", d => d.startYear === d.endYear ? newX(d.startYear) + modifyImageXoffset : (newX(d.startYear) + newX(d.endYear)) / 2)
            .style("display", d => (newX(d.endYear) < 0 || newX(d.startYear) > width) ? "none" : null);
        svg.selectAll(".imageCitation")
            .attr("x", d => d.startYear === d.endYear ? newX(d.startYear) + modifyImageCitationXoffset : (newX(d.startYear) + newX(d.endYear)) / 2)
            .style("display", d => (newX(d.endYear) < 0 || newX(d.startYear) > width) ? "none" : null);            

    }

    render();
    
    // 全期間を表示するボタンクリック時の処理
    d3.select("#show-all-button").on("click", () => {
        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
        // データの再描画
        render();
    });

    d3.select("#re-render").on("click", () => {
        // データの再描画
        svg.transition()
            .duration(750)
            .call(zoom.transform,currentTransform);
        // データの再描画
        render();
    });

});
