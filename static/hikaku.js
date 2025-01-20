// ズームとパンを対象にするための修正版

// ズームとパンの設定
const zoom = d3.zoom()
    .scaleExtent([0.1, 5000]) // 拡大縮小の範囲を設定
    .on("zoom", zoomed);

svg.call(zoom);

// ズーム状態を保持する変数
let currentTransform = d3.zoomIdentity;

// ズームイベントの処理
function zoomed(event) {
    currentTransform = event.transform; // 現在のズーム状態を記録
    const newX = event.transform.rescaleX(x);
    xAxis.scale(newX);

    // X軸の更新
    svg.select(".x.axis").call(xAxis);
    svg.select(".x.axis_upper").call(xAxis);

    // イベントの再描画
    svg.selectAll("rect")
        .attr("x", d => newX(d.startYear))
        .attr("width", d => newX(d.endYear) - newX(d.startYear));

    svg.selectAll("circle")
        .attr("cx", d => newX(d.startYear));

    svg.selectAll(".event-label")
        .attr("x", d => d.startYear === d.endYear ? newX(d.startYear) + 5 : (newX(d.startYear) + newX(d.endYear)) / 2);

    svg.selectAll("image")
        .attr("x", d => d.startYear === d.endYear ? newX(d.startYear) - 75 : (newX(d.startYear) + newX(d.endYear)) / 2 - 25);
}

// 背景矩形をズーム操作の対象として追加
svg.insert("rect", ":first-child") // 他の要素の背面に配置
    .attr("class", "background-rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .style("fill", "transparent")
    .style("pointer-events", "all");

// 描画関数
function render() {
    // イベント画像の描画
    const images = svg.selectAll("image")
        .data(showImages ? data.filter(d => d.image) : [], d => d.event);

    images.enter().append("image")
        .merge(images)
        .attr("x", d => d.startYear === d.endYear ? x(d.startYear) - 75 : (x(d.startYear) + x(d.endYear)) / 2 - 25)
        .attr("y", d => groupScale(d.group) + (eventOffset * 2))
        .attr("width", 70)
        .attr("height", 70)
        .attr("xlink:href", d => d.image);

    images.exit().remove();

    // 期間イベントの描画
    const rects = svg.selectAll("rect.event")
        .data(data.filter(d => d.startYear !== d.endYear), d => d.event);

    rects.enter().append("rect")
        .attr("class", d => `event event-group-${d.group}`)
        .merge(rects)
        .attr("x", d => x(d.startYear))
        .attr("y", d => groupScale(d.group) + eventOffset - 2)
        .attr("width", d => x(d.endYear) - x(d.startYear))
        .attr("height", groupScale.bandwidth() / 10)
        .attr("fill", d => d.eventColor);

    rects.exit().remove();

    // 期間を持たないイベントの描画
    const circles = svg.selectAll("circle")
        .data(data.filter(d => d.startYear === d.endYear), d => d.event);

    circles.enter().append("circle")
        .attr("class", d => `event event-group-${d.group}`)
        .merge(circles)
        .attr("cx", d => x(d.startYear))
        .attr("cy", (d, i) => groupScale(d.group) + (eventOffset * 2) + (i % numEvent * eventOffset))
        .attr("r", 2)
        .attr("fill", d => d.eventColor);

    circles.exit().remove();

    // イベントラベルの描画
    const labels = svg.selectAll(".event-label")
        .data(data, d => d.event);

    labels.enter().append("text")
        .attr("class", d => `event-label event-group-${d.group}`)
        .merge(labels)
        .attr("x", d => d.startYear === d.endYear ? x(d.startYear) + 5 : (x(d.startYear) + x(d.endYear)) / 2)
        .attr("y", (d, i) => d.startYear === d.endYear ? (groupScale(d.group) + (eventOffset * 2) + (i % numEvent * eventOffset) + 5) : (groupScale(d.group) + eventOffset - 4))
        .attr("text-anchor", d => d.startYear === d.endYear ? "" : "middle")
        .text(d => d.event);

    labels.exit().remove();
}

// 初期描画
render();

// 全期間を表示するボタン
d3.select("#show-all-button").on("click", () => {
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
});
