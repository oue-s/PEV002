// サイズとマージンの設定
const margin = { top: 20, right: 20, bottom: 30, left: 150 }; // left margin increased
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
let x = d3.scaleTime().range([0, width]);
let y = d3.scaleBand().range([0, height]);

// 月の表記を日本語に
const formatMonth = d3.timeFormatLocale({
    "dateTime": "%a %b %e %X %Y",
    "date": "%Y/%m/%d",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
    "shortDays": ["日", "月", "火", "水", "木", "金", "土"],
    "months": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    "shortMonths": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
});

let xAxis = d3.axisBottom(x).tickFormat(formatMonth.format("%Y-%m"));


document.write(myVariable)

// CSVファイルの読み込み
d3.csv(myVariable).then(data => {
//d3.csv("C:\Users\sooka\camp\python\product_0_01\disp_csv\disp_1.csv").then(data => {
// d3.csv("/static/data/disp_1.csv").then(data => {
//d3.csv("data.csv").then(data => {

    // データのパース
    data.forEach(d => {
        d.startDate = new Date(d.startYear, d.startMonth - 1, d.startDay);
        d.endDate = d.endYear && d.endMonth && d.endDay ? new Date(d.endYear, d.endMonth - 1, d.endDay) : d.startDate;
    });

    // グループ化
    const groups = Array.from(new Set(data.map(d => d.group)));
    const groupScale = d3.scaleBand().domain(groups).range([0, height]);

    // スケールのドメイン設定
    x.domain([d3.min(data, d => d.startDate), d3.max(data, d => d.endDate || d.startDate)]);

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
    const groupTitles = Array.from(new Set(data.map(d => ({group: d.group, groupTitle: d.groupTitle, groupColor: d.groupColor}))));

    svg.selectAll(".group-title")
        .data(groupTitles)
        .enter()
        .append("text")
        .attr("class", "group-title")
        .attr("x", -margin.left + 10) // 少し余白を持たせて左端に配置
        .attr("y", d => groupScale(d.group) + (groupScale.bandwidth() / 2))
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .text(d => d.groupTitle)
        .style("fill", d => d.groupColor); // グループの色を適用

    // データの描画関数
    function render() {
        // 期間イベントの描画
        const rects = svg.selectAll("rect")
            .data(data.filter(d => d.startDate.getTime() !== d.endDate.getTime()), d => d.event);

        rects.enter().append("rect")
            .attr("class", d => `event event-group-${d.group}`)
            .merge(rects)
            .attr("x", d => x(d.startDate))
            .attr("y", d => groupScale(d.group) + (groupScale.bandwidth() / 4))
            .attr("width", d => x(d.endDate) - x(d.startDate))
            .attr("height", groupScale.bandwidth() / 10); 

        rects.exit().remove();

        // 期間を持たないイベントの描画
        const circles = svg.selectAll("circle")
            .data(data.filter(d => d.startDate.getTime() === d.endDate.getTime()), d => d.event);

        circles.enter().append("circle")
            .attr("class", d => `event event-group-${d.group}`)
            .merge(circles)
            .attr("cx", d => x(d.startDate))
            .attr("cy", d => groupScale(d.group) + (groupScale.bandwidth() / 4))
            .attr("r", 5);

        circles.exit().remove();

        // イベントラベルの描画
        const labels = svg.selectAll(".event-label")
            .data(data, d => d.event);

        labels.enter().append("text")
            .attr("class", d => `event-label event-group-${d.group}`)
            .merge(labels)
            .attr("x", d => d.startDate.getTime() === d.endDate.getTime() ? x(d.startDate) : (x(d.startDate) + x(d.endDate)) / 2)
            .attr("y", d => d.startDate.getTime() === d.endDate.getTime() ? (groupScale(d.group) + (groupScale.bandwidth() / 4) - 10) : (groupScale(d.group) + (groupScale.bandwidth() / 4) - 10))
            .attr("text-anchor", "middle")
            .text(d => d.event);

        labels.exit().remove();

        イベント画像の描画
        const images = svg.selectAll(".event-image")
            .data(data, d => d.event);

        images.enter().append("image")
            .attr("class", "event-image")
            .merge(images)
            .attr("x", d => d.startDate.getTime() === d.endDate.getTime() ? (x(d.startDate) - 20) : ((x(d.startDate) + x(d.endDate)) / 2 - 20))
            .attr("y", d => groupScale(d.group) + (groupScale.bandwidth() / 4) - 20)
            .attr("width", 40)
            .attr("height", 40)
            .attr("href", d => d.image); // 画像のURLを設定

        images.exit().remove();
    }

    // ズームとパンの設定
    let zoom = d3.zoom()
        .scaleExtent([0.1, 1000])
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
        const newX = event.transform.rescaleX(x);
        xAxis.scale(newX);
        svg.select(".x.axis").call(xAxis);
        svg.selectAll("rect")
            .attr("x", d => newX(d.startDate))
            .attr("width", d => newX(d.endDate) - newX(d.startDate))
            .style("display", d => (newX(d.endDate) < 0 || newX(d.startDate) > width) ? "none" : null);
        svg.selectAll("circle")
            .attr("cx", d => newX(d.startDate))
            .style("display", d => (newX(d.startDate) < 0 || newX(d.startDate) > width) ? "none" : null);
        svg.selectAll(".event-label")
            .attr("x", d => d.startDate.getTime() === d.endDate.getTime() ? newX(d.startDate) : (newX(d.startDate) + newX(d.endDate)) / 2)
            .style("display", d => (newX(d.endDate) < 0 || newX(d.startDate) > width) ? "none" : null);
        svg.selectAll(".event-image")
            .attr("x", d => d.startDate.getTime() === d.endDate.getTime() ? (newX(d.startDate) - 20) : ((newX(d.startDate) + newX(d.endDate)) / 2 - 20));
    }

    render();
    
        // 全期間を表示するボタンクリック時の処理
    d3.select("#show-all-button").on("click", () => {
        // 全期間のドメインを再設定
        x.domain([d3.min(data, d => d.startDate), d3.max(data, d => d.endDate || d.startDate)]);
        
        // 軸の更新
        svg.select(".x.axis").call(xAxis.scale(x));
        
        // ズームのリセット
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
        
        // データの再描画
        render();
    });
});
