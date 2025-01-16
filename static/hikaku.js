// サイズとマージンの設定
const margin = { top: 50, right: 20, bottom: 20, left: 150 }; // 上マージンを調整
const width = 960 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

// グループごとの固定高さ
const groupHeight = 50; // 固定値（各グループの高さ）
const totalHeight = groupHeight * 5; // グループ数に応じた高さ調整

// SVGの作成
const svg = d3.select(".chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", totalHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// スケールの設定
const x = d3.scaleLinear().domain([-1e8, new Date().getFullYear()]).range([0, width]);
const y = d3.scaleBand().range([0, totalHeight]);

// 年の表記を指数に
const formatYear = d3.format("d");
const xAxis = d3.axisBottom(x).tickFormat(d => {
    if (d < -9999 || d > 9999) {
        return d3.format(".0e")(d);
    }
    return formatYear(d);
});

// CSVファイルの読み込み
d3.csv(myVariable).then(data => {
    // データのパース
    data.forEach(d => {
        d.startYear = +d.startYear;
        d.endYear = d.endYear ? +d.endYear : d.startYear;
    });

    // グループ化
    const groups = Array.from(new Set(data.map(d => d.group)));
    const groupScale = d3.scaleBand().domain(groups).range([0, totalHeight]).padding(0.2);

    // スケールのドメイン設定
    x.domain(d3.extent(data, d => d.startYear));

    // 軸の追加
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${totalHeight})`)
        .call(xAxis);

    // 軸の追加(上)
    svg.append("g")
        .attr("class", "x axis_upper")
        .attr("transform", `translate(0,-20)`) // 上に余白を作る
        .call(xAxis);

    // データの描画関数
    function render() {
        const images = svg.selectAll("image")
            .data(data.filter(d => d.image), d => d.event);

        images.enter().append("image")
            .merge(images)
            .attr("x", d => d.startYear === d.endYear ? x(d.startYear) - 25 : (x(d.startYear) + x(d.endYear)) / 2 - 25)
            .attr("y", d => groupScale(d.group) + groupScale.bandwidth() / 2 - 35) // 調整済みのY座標
            .attr("width", 70)
            .attr("height", 70)
            .attr("xlink:href", d => d.image);

        images.exit().remove();

        const rects = svg.selectAll("rect")
            .data(data.filter(d => d.startYear !== d.endYear), d => d.event);

        rects.enter().append("rect")
            .merge(rects)
            .attr("x", d => x(d.startYear))
            .attr("y", d => groupScale(d.group) + groupScale.bandwidth() / 4)
            .attr("width", d => x(d.endYear) - x(d.startYear))
            .attr("height", groupHeight / 10)
            .attr("fill", d => d.color);

        rects.exit().remove();

        const labels = svg.selectAll(".event-label")
            .data(data, d => d.event);

        labels.enter().append("text")
            .merge(labels)
            .attr("x", d => d.startYear === d.endYear ? x(d.startYear) : (x(d.startYear) + x(d.endYear)) / 2)
            .attr("y", d => groupScale(d.group) + groupScale.bandwidth() / 2)
            .attr("text-anchor", "middle")
            .text(d => d.event)
            .attr("fill", d => d.group_color);

        labels.exit().remove();
    }

    render();
});
