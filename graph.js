function updateGraph() {
    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.9;
    const isMobile = window.innerWidth <= 768;
    const sourceNodeId = "Your Name"; 
    d3.select("#graph").select("svg").remove();

    const svg = d3.select("#graph").append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.json("data.json").then(function(graph) {
        // Calculate node size based on viewport size
        const maxNodeSize = isMobile ? 40 : 200;
        graph.nodes.forEach(node => {
            node.size = Math.min(maxNodeSize, node.size);
            if (isMobile && node.id === sourceNodeId) {
                node.size = 150;
            }
        });

        svg.append("defs").selectAll("pattern")
            .data(graph.nodes)
            .enter().append("pattern")
            .attr("id", d => "image-" + d.id.replace(/\s+/g, ''))
            .attr("width", 1)
            .attr("height", 1)
            .append("image")
            .attr("xlink:href", d => d.image)
            .attr("width", d => d.size * 2)
            .attr("height", d => d.size * 2)
            .attr("x", 0)
            .attr("y", 0);

        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link");

        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .enter().append("g")
            .on("click", (event, d) => window.open(d.url, '_blank'));

        node.append("circle")
            .attr("class", "node")
            .attr("r", d => d.size)
            .attr("fill", d => "url(#image-" + d.id.replace(/\s+/g, '') + ")")
            .attr("stroke", "none");

        const simulation = d3.forceSimulation(graph.nodes)
            .force("link", d3.forceLink(graph.links).id(d => d.id).distance(isMobile ? 100 : 200))
            .force("charge", d3.forceManyBody().strength(isMobile ? -900 : -300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .on("tick", ticked);

        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.attr("transform", d => `translate(${d.x},${d.y})`);
        }

        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        node.call(drag(simulation));
    });
}

window.addEventListener('resize', updateGraph);
document.addEventListener('DOMContentLoaded', updateGraph);