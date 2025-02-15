// サイズとマージンの設定
const margin = { top: 40, right: 20, bottom: 20, left: 150 }; // SVG全体のマージン
const width = 960;//有効描画範囲の横幅
const height1 = 15;//最上部表示レーンの高さ 期間ありイベントのtext
const height2 = 15;//最上部表示レーンの高さ 期間ありイベント
const eventOffset = 15;//通常表示レーンの高さ
const numEvent = 4;//通常表示レーンの数
const height3 = 15;//最下部表示レーンの高さ 引用text
let groupHeight = height1 + height2 + eventOffset * numEvent + height3;//一つのグループの高さ
let numberHis = Number(numHis) //app.pyより選択されたアイテムの数をもらってくる
let height = groupHeight * numberHis;//有効描画範囲の高さ

const modifyLogoXoffset = 10
const modifyLogoYoffset = -20
const s_rectHeight = 5
const s_rectWidth = 5

const modifyIDXoffset = 140
const modifyIDYoffset = -5

const tickHeight = height;
const modifyAxisUpper = -10

const modifyImageXoffset = -75
const widthImage = 70;
const heightImage = 70;

const heightRectEvent = 10;

const modifyEventXoffset = 0; 
const modifyEventYoffset = 7;
const modifyTextXoffset = -6; //文字の・が時間軸と一致するように微調整
const modifyTextYoffset = 11; //textオブジェクトのY軸起点がテキストの中央になっているための補正

const modifyCircleYofset = 7;//circleオブジェクトのY軸起点が補正
const rCircle = 3;//circleオブジェクトの半径


const modifyImageCitationXoffset = -75;


const marginXupper = 0;

let dispID = currentId;

// ズーム状態を保持する変数
let currentTransform = d3.zoomIdentity;
let currentTransform_0 = d3.zoomIdentity;

// grupeScaleの変更
let scaleEscape = 0;



// デバグ用　変数が来ていることの確認 
// document.write(showImages)
console.log("auto_detail_value",auto_detail_value)
console.log(currentId)
console.log(dispID)

showImages = false;

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

// 簡易ロゴ表示
svg.append("text")
    .attr("x", -margin.left + modifyLogoXoffset)
    .attr("y", modifyLogoYoffset) 
    // .attr("text-anchor", "middle") // 中央揃え
    // .style("font-style", "italic")
    .style("font-weight", "bold")
    .style("font-size", "15px")
    .style("fill", "black")
    .text("Phoenix Eye View");
// ID表示
svg.append("text")
    .attr("x", -margin.left + modifyIDXoffset)
    .attr("y", modifyIDYoffset) 
    .attr("text-anchor", "end") 
    .style("font-size", "10px")
    .style("fill", "black")
    .text(`ID:${currentId}`);

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
    let groupScale = d3.scaleBand().domain(groups).range([0,height]);
    // スケールのドメイン設定
    x.domain(d3.extent(data, d => d.startYear));



    // 軸(下)を追加（実線）
    const xAxisGroup = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis.tickSize(-tickHeight+modifyAxisUpper).tickSizeOuter(0)); // 補助線を描画      
    // 軸の線(下)設定
    xAxisGroup.select("path") // 軸の線
        .attr("stroke", "black") // 軸の色
        .attr("stroke-width", 1) // 軸の太さ
        .attr("stroke-dasharray", ""); // 実線にする（デフォルト）
    // 補助線(下)設定
    xAxisGroup.selectAll("line") // 目盛りの線（補助線を含む）
        .attr("stroke", "gray") // 補助線の色
        .attr("stroke-width", 0.5) // 軸の太さ
        .attr("stroke-dasharray", "4 2"); // 点線パターン

    // 軸(上)を追加（実線）
    const xAxisUpperGroup = svg.append("g")
        .attr("class", "x axis_upper")
        .attr("transform", `translate(0,${modifyAxisUpper})`)
        .call(xAxis.tickSize(0).tickSizeOuter(0)); // 補助線を描画      
    // 軸の線(上)設定
    xAxisUpperGroup.select("path") // 軸の線
        .attr("stroke", "black") // 軸の色
        .attr("stroke-width", 1) // 軸の太さ
        .attr("stroke-dasharray", ""); // 実線にする（デフォルト）
    // 補助線(上)設定
    xAxisUpperGroup.selectAll("line") // 目盛りの線（補助線を含む）
        .attr("stroke", "gray") // 補助線の色
        .attr("stroke-width", 0.5) // 軸の太さ
        .attr("stroke-dasharray", "4 2"); // 点線パターン
    // 数値(上)設定
    xAxisUpperGroup.selectAll("text") 
        .attr("dy", "-1em");



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
            .attr("stroke-width", 0.5);

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
            .style("font-size","15px")
            //.style("fill","red")
            .text(d => d.title)

        // イベント画像の描画
        const images = svg.selectAll("image.eventImage")
            // .data(data.filter(d => d.image), d => d.event);
            .data(showImages ? data.filter(d => d.image) : [], d => d.event);

        images.enter().append("image")
            .attr("class", d => `eventImage event-group-${d.group}`)
            .merge(images)
            .attr("x", d => d.startYear === d.endYear ? x(d.startYear) + modifyImageXoffset  : (x(d.startYear) + x(d.endYear)) / 2)
            .attr("y", d => groupScale(d.group) + height1+ height2)
            .attr("width", widthImage)
            .attr("height", heightImage)
            .attr("xlink:href", d => d.image)
            .on("click" , (event,d) => d.detailLink !== "" ?  window.open(d.detailLink) :  undefined)
            .on("mouseover" , (event,d) => d.detailLink !== "" ? d3.select(event.target).style("cursor", "pointer") : undefined);

        images.exit().remove();

        // イベント画像引用の描画
        const citations = svg.selectAll("text.imageCitation")
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

        // 大期間イベントの描画
        const rects = svg.selectAll("rect.type01")
            .data(data.filter(d => d.eventType === "1"), d => d.event);

        rects.enter().append("rect")
            .attr("class", d => `type01 event-group-${d.group}`)
            .merge(rects)
            .attr("x", d => x(d.startYear))
            .attr("y", d => groupScale(d.group) + height1)
            .attr("width", d => x(d.endYear) - x(d.startYear))
            .attr("height", heightRectEvent)
            .attr("fill", d => d.eventColor);

        rects.exit().remove();

       // 大期間イベントラベルの描画
        const lLabels = svg.selectAll("text.type01")
            .data(data.filter(d => d.eventType === "1"), d => d.event);

        lLabels.enter().append("text")
            .attr("class", d => `type01 event-group-${d.group}`)
            .merge(lLabels)
            .attr("x", d => (x(d.startYear) + x(d.endYear)) / 2)
            .attr("y", (d,i) => groupScale(d.group) + modifyTextYoffset)
            .attr("text-anchor", "middle")
            .attr("font-size","13px")
            .text(d => d.event)

        lLabels.exit().remove();

        // 詳細イベントの描画
        // const circles = svg.selectAll("circle.type02")
        //     .data(data.filter(d => d.eventType === "2"), d => d.event);

        // circles.enter().append("circle")
        //     .attr("class", d => `type02 event-group-${d.group}`)
        //     .merge(circles)
        //     .attr("cx", d => x(d.startYear))
        //     .attr("cy", (d,i) => d.dispPos !== "" ?
        //              (groupScale(d.group) + modifyCircleYofset + (height1 + height2) + ((Number(d.dispPos)-1) % numEvent * eventOffset)) 
        //              : (groupScale(d.group) + modifyCircleYofset + (height1 + height2) + (i % numEvent * eventOffset)))
        //     .attr("r", rCircle)
        //     .attr("fill", d => d.eventColor);

        // circles.exit().remove();

        // 期間詳細イベントの描画
        const rects2 = svg.selectAll("rect.type02")
            .data(data.filter(d => d.eventType === "2"), d => d.event);

        rects2.enter().append("rect")
            .attr("class", d => `type02 event-group-${d.group}`)
            .merge(rects2)
            .attr("x", d => x(d.startYear)-(s_rectWidth / 2))
            .attr("y", (d,i) => d.dispPos !== "" ?
                     (groupScale(d.group) -(s_rectHeight /2) + (height1 + height2) + ((Number(d.dispPos)-1) % numEvent * eventOffset) + modifyEventYoffset) 
                     : (groupScale(d.group) -(s_rectHeight /2) + (height1 + height2) + (i % numEvent * eventOffset) + modifyEventYoffset))
            .attr("width", d => x(d.endYear) - x(d.startYear) === 0 ? s_rectWidth : x(d.endYear) - x(d.startYear) + (s_rectWidth / 2))
            .attr("height", s_rectHeight)
            .attr("fill", d => d.eventColor);

        rects2.exit().remove();

        // 詳細イベントラベルの描画
        const labels = svg.selectAll("text.type02")
            .data(data.filter(d => d.eventType === "2"), d => d.event);

        labels.enter().append("text")
            .attr("class", d => `type02 event-group-${d.group}`)
            .merge(labels)
            .attr("x", d => x(d.endYear) - x(d.startYear) === 0 ? x(d.startYear) + modifyTextXoffset : x(d.endYear) + modifyTextXoffset)
            .attr("y", (d,i) => d.dispPos !== "" ?
                     (groupScale(d.group) + modifyTextYoffset + (height1 + height2) + ((Number(d.dispPos)-1) % numEvent * eventOffset)) 
                     : (groupScale(d.group) + modifyTextYoffset + (height1 + height2) + (i % numEvent * eventOffset)))
            // .attr("text-anchor", "" )
            .text(d => `・${d.event}`)

        labels.exit().remove();

    }

    // ズームとパンの設定
    const zoom = d3.zoom()
        .scaleExtent([0.1, 5000]) // 拡大縮小の範囲を設定
        .on("zoom", zoomed);

    svg.call(zoom);

    // デバク用 zoomにより連続的に変化する変数を表示する位置
    const scaleText = svg.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", "black")
        .style("font-size", "16px");

    function zoomed(event) {
        currentTransform = event.transform; // 現在のズーム状態を記録

        // 表示内容をコントロール
        if(selectedCondition === "B"){
            scaleEscape = 0
            groupHeight = height1 + height2 + eventOffset * numEvent + height3
            height = groupHeight * numberHis 
            groupScale = d3.scaleBand().domain(groups).range([0,height]);
        }else if(selectedCondition === "C"){
            scaleEscape = -10000
            groupHeight = height1 + height2
            height = groupHeight * numberHis
            groupScale = d3.scaleBand().domain(groups).range([0,height]);   
        }else if(currentTransform.k < auto_detail_value){
            scaleEscape = -10000
            groupHeight = height1 + height2
            height = groupHeight * numberHis
            groupScale = d3.scaleBand().domain(groups).range([0,height]);   
        }else{
            scaleEscape = 0
            groupHeight = height1 + height2 + eventOffset * numEvent + height3
            height = groupHeight * numberHis 
            groupScale = d3.scaleBand().domain(groups).range([0,height]);  
        }

        //デバク用 検証->コンソールに変数値を表示
        console.log(currentTransform_0.k,currentTransform.k);
          //デバグ用 SVG内に変数値を表示する
        // scaleText.text(`Zoom Scale in SVG: ${currentTransform_0.k.toFixed(2)},${currentTransform.k.toFixed(2)},${scaleEscape}`);
        currentTransform_0 = currentTransform;



        const newX = event.transform.rescaleX(x);
        xAxis.scale(newX);

        svg.select(".x.axis").call(xAxis.tickSize(-tickHeight+modifyAxisUpper).tickSizeOuter(0));
        // 軸の線(下)を設定
        xAxisGroup.select("path") // 軸の線
            .attr("stroke", "black") // 軸の色
            .attr("stroke-width", 1) // 軸の太さ
            .attr("stroke-dasharray", ""); // 実線にする（デフォルト）
        // 補助線(下)を設定
        xAxisGroup.selectAll("line") // 目盛りの線（補助線を含む）
            .attr("stroke", "gray") // 補助線の色
            .attr("stroke-width", 0.5) // 軸の太さ
            .attr("stroke-dasharray", "4 2"); // 点線パターン

        svg.select(".x.axis_upper").call(xAxis.tickSize(0).tickSizeOuter(0));
        // 数値(上)に設定
        xAxisUpperGroup.selectAll("text") 
            .attr("dy", "-1em");

        svg.selectAll(".group-title")
            .attr("y", d => groupScale(d.group) + groupScale.bandwidth() / 2)
            .attr("dy", "0.35em")

        svg.selectAll(".group-line")
            .attr("y1", d => scaleEscape + groupScale(d) + groupScale.bandwidth())
            .attr("y2", d => scaleEscape + groupScale(d) + groupScale.bandwidth())

        svg.selectAll("image.eventImage")
            .attr("x", d => d.startYear === d.endYear ? newX(d.startYear) + modifyImageXoffset : (newX(d.startYear) + newX(d.endYear)) / 2)
            .attr("y", d => scaleEscape + groupScale(d.group) + height1+ height2)
            .style("display", d => (newX(d.endYear) < 0 || newX(d.startYear) > width) ? "none" : null);
        svg.selectAll("text.imageCitation")
            .attr("x", d => d.startYear === d.endYear ? newX(d.startYear) + modifyImageCitationXoffset : (newX(d.startYear) + newX(d.endYear)) / 2)
            .attr("y", d => (scaleEscape + groupScale(d.group) + modifyTextYoffset + height1 + height2 + eventOffset*numEvent))
            .style("display", d => (newX(d.endYear) < 0 || newX(d.startYear) > width) ? "none" : null);            

        svg.selectAll("rect.type01")
            .attr("x", d => newX(d.startYear))
            .attr("width", d => newX(d.endYear) - newX(d.startYear))
            .attr("y", d => groupScale(d.group) + height1)
            
            .style("display", d => (newX(d.endYear) < 0 || newX(d.startYear) > width) ? "none" : null);
        svg.selectAll("text.type01")
            .attr("x", d => (newX(d.startYear) + newX(d.endYear)) / 2)
            .attr("y", (d,i) => groupScale(d.group) + modifyTextYoffset)
            .style("display", d => (newX(d.endYear) < 0 || newX(d.startYear) > width) ? "none" : null);

        // svg.selectAll("circle.type02")
        //     .attr("cx", d => newX(d.startYear))
        //     .attr("cy", (d,i) => d.dispPos !== "" ?
        //              (scaleEscape + groupScale(d.group) + modifyCircleYofset + (height1 + height2) + ((Number(d.dispPos)-1) % numEvent * eventOffset)) 
        //              : (scaleEscape + groupScale(d.group) + modifyCircleYofset + (height1 + height2) + (i % numEvent * eventOffset)))
        //     .style("display", d => (newX(d.startYear) < 0 || newX(d.startYear) > width) ? "none" : null);

        svg.selectAll("rect.type02")
            .attr("x", d => newX(d.startYear)-(s_rectWidth / 2))
            .attr("width", d => newX(d.endYear) - newX(d.startYear) === 0 ? s_rectWidth : newX(d.endYear) - newX(d.startYear) + (s_rectWidth / 2))
            .attr("y", (d,i) => d.dispPos !== "" ?
                     (scaleEscape + groupScale(d.group) -(s_rectHeight /2) + (height1 + height2) + ((Number(d.dispPos)-1) % numEvent * eventOffset + modifyEventYoffset)) 
                     : (scaleEscape + groupScale(d.group) -(s_rectHeight /2) + (height1 + height2) + (i % numEvent * eventOffset) + modifyEventYoffset))
            // .style("display", d => (newX(d.startYear) < 0 || newX(d.startYear) > width) ? "none" : null);
            .style("display", d => (newX(d.endYear) < 0 || newX(d.startYear) > width) ? "none" : null);
        svg.selectAll("text.type02")
            .attr("x", d => newX(d.endYear) - newX(d.startYear) === 0 ? newX(d.startYear) + modifyTextXoffset : newX(d.endYear) + modifyTextXoffset)
            .attr("y", (d,i) => d.dispPos !== "" ?
                     (scaleEscape + groupScale(d.group) + modifyTextYoffset + (height1 + height2) + ((Number(d.dispPos)-1) % numEvent * eventOffset)) 
                     : (scaleEscape + groupScale(d.group) + modifyTextYoffset + (height1 + height2) + (i % numEvent * eventOffset)))
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
        svg.transition()
            .duration(750)
            .call(zoom.transform,currentTransform);
        // データの再描画
        render();
    });

    d3.select("#toggleButton").on("click",() => {
        console.log(button.textContent,showImages);
        svg.transition()
            .duration(750)
            .call(zoom.transform,currentTransform);
        // データの再描画
        render();
    });


    d3.select("#btnA").on("click",() => {
    console.log(selectedCondition);
    svg.transition()
        .duration(750)
        .call(zoom.transform,currentTransform);
    // データの再描画
    render();
    });
    d3.select("#btnB").on("click",() => {
    console.log(selectedCondition);
    svg.transition()
        .duration(750)
        .call(zoom.transform,currentTransform);
    // データの再描画
    render();
    });
    d3.select("#btnC").on("click",() => {
    console.log(selectedCondition);
    svg.transition()
        .duration(750)
        .call(zoom.transform,currentTransform);
    // データの再描画
    render();
    });



});
