// サイズとマージンの設定
const margin = { top: 20, right: 20, bottom: 30, left: 150 }; // 左マージンを大きく設定
const width = 960 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

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

// document.write(myVariable)

// CSVファイルの読み込み
d3.csv(myVariable).then(data => {
    // データのパース
    data.forEach(d => {
        d.startYear = +d.startYear;
        d.endYear = d.endYear ? +d.endYear : d.startYear;
    });

    // グループ化
    const groups = Array.from(new Set(data.map(d => d.group)));
    const groupScale = d3.scaleBand().domain(groups).range([0, height]);

    // スケールのドメイン設定
    x.domain(d3.extent(data, d => d.startYear));

    // 軸の追加
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
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
        return { group: group, title: groupData.groupTitle, color: groupData.groupColor };
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
        .text(d => d.title)
        .style("fill", d => d.color);
        
    // データの描画関数
    function render() {
        // 期間イベントの描画
        const rects = svg.selectAll("rect")
            .data(data.filter(d => d.startYear !== d.endYear), d => d.event);

        rects.enter().append("rect")
            .attr("class", d => `event event-group-${d.group}`)
            .merge(rects)
            .attr("x", d => x(d.startYear))
            .attr("y", d => groupScale(d.group) + (groupScale.bandwidth() / 4))
            .attr("width", d => x(d.endYear) - x(d.startYear))
            .attr("height", groupScale.bandwidth() / 10)
            .attr("fill", d => d.color);

        rects.exit().remove();

        // 期間を持たないイベントの描画
        const circles = svg.selectAll("circle")
            .data(data.filter(d => d.startYear === d.endYear), d => d.event);

        circles.enter().append("circle")
            .attr("class", d => `event event-group-${d.group}`)
            .merge(circles)
            .attr("cx", d => x(d.startYear))
            .attr("cy", d => groupScale(d.group) + (groupScale.bandwidth() / 4))
            .attr("r", 5)
            .attr("fill", d => d.group_color);

        circles.exit().remove();

        // イベントラベルの描画
        const labels = svg.selectAll(".event-label")
            .data(data, d => d.event);

        labels.enter().append("text")
            .attr("class", d => `event-label event-group-${d.group}`)
            .merge(labels)
            .attr("x", d => d.startYear === d.endYear ? x(d.startYear) : (x(d.startYear) + x(d.endYear)) / 2)
            .attr("y", d => d.startYear === d.endYear ? (groupScale(d.group) + (groupScale.bandwidth() / 4) - 10) : (groupScale(d.group) + (groupScale.bandwidth() / 4) - 10))
            .attr("text-anchor", "middle")
            .text(d => d.event)
            .attr("fill", d => d.group_color);

        labels.exit().remove();

        // イベント画像の描画
        const images = svg.selectAll("image")
            .data(data.filter(d => d.image), d => d.event);

        images.enter().append("image")

            .merge(images)
            .attr("x", d => d.startYear === d.endYear ? x(d.startYear) - 25 : (x(d.startYear) + x(d.endYear)) / 2 - 25)
            .attr("y", d => groupScale(d.group) + (groupScale.bandwidth() / 4) +20)
            .attr("width", 70)
            .attr("height", 70)
            .attr("xlink:href", d => d.image);

        images.exit().remove();
    }

    // ズームとパンの設定
    const zoom = d3.zoom()
        .scaleExtent([0.1, 5000]) // 拡大縮小の範囲を設定
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
        const newX = event.transform.rescaleX(x);
        xAxis.scale(newX);
        svg.select(".x.axis").call(xAxis);
        svg.selectAll("rect")
            .attr("x", d => newX(d.startYear))
            .attr("width", d => newX(d.endYear) - newX(d.startYear))
            .style("display", d => (newX(d.endYear) < 0 || newX(d.startYear) > width) ? "none" : null);
        svg.selectAll("circle")
            .attr("cx", d => newX(d.startYear))
            .style("display", d => (newX(d.startYear) < 0 || newX(d.startYear) > width) ? "none" : null);
        svg.selectAll(".event-label")
            .attr("x", d => d.startYear === d.endYear ? newX(d.startYear) : (newX(d.startYear) + newX(d.endYear)) / 2)
            .style("display", d => (newX(d.endYear) < 0 || newX(d.startYear) > width) ? "none" : null);
        svg.selectAll("image")
            .attr("x", d => d.startYear === d.endYear ? newX(d.startYear) - 25 : (newX(d.startYear) + newX(d.endYear)) / 2 - 25);
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
});
