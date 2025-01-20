// SVG背景用の矩形を追加して全体を操作可能にする
svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all"); // 背景全体を操作可能に

// ズームとパンの設定
const zoom = d3.zoom()
    .scaleExtent([0.1, 5000]) // 拡大縮小の範囲を設定
    .on("zoom", zoomed);

svg.call(zoom);

// ズーム状態を保持する変数
let currentTransform = d3.zoomIdentity;

function zoomed(event) {
    currentTransform = event.transform; // 現在のズーム状態を記録

    // 軸の再スケール
    const newX = event.transform.rescaleX(x);
    xAxis.scale(newX);

    // X軸の再描画
    svg.select(".x.axis").call(xAxis);
    svg.select(".x.axis_upper").call(xAxis);

    // 四角形の再描画
    svg.selectAll("rect.data-rect")
        .attr("x", d => newX(d.startYear))
        .attr("width", d => newX(d.endYear) - newX(d.startYear))
        .style("display", d => (newX(d.endYear) < 0 || newX(d.startYear) > width) ? "none" : null);

    // 円の再描画
    svg.selectAll("circle")
        .attr("cx", d => newX(d.startYear))
        .style("display", d => (newX(d.startYear) < 0 || newX(d.startYear) > width) ? "none" : null);

    // ラベルの再描画
    svg.selectAll(".event-label")
        .attr("x", d => d.startYear === d.endYear ? newX(d.startYear) + 5 : (newX(d.startYear) + newX(d.endYear)) / 2)
        .style("display", d => (newX(d.endYear) < 0 || newX(d.startYear) > width) ? "none" : null);

    // イメージの再描画
    svg.selectAll("image")
        .attr("x", d => d.startYear === d.endYear ? newX(d.startYear) - 75 : (newX(d.startYear) + newX(d.endYear)) / 2 - 25);
}
