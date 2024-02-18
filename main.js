import './style.css';

let svg = document.getElementById('svgCanvas');
let lines = [];
let circles = [];
let points = [];
let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
polygon.setAttribute("stroke", "black");
polygon.setAttribute("fill", "url(#myGradient)");
svg.appendChild(polygon);

function updatePolygon() {
  let pointsStr = points.map(p => `${p.x},${p.y}`).join(" ");
  polygon.setAttribute("points", pointsStr);
}

function addPoint(event) {
  let point = {
    x: event.clientX - svg.getBoundingClientRect().left,
    y: event.clientY - svg.getBoundingClientRect().top
  };

  if (points.length === 0) {
    points.push(point);
  } else {
    points.push(point);
    if (points.length > 1) {
      let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("stroke", "black");
      svg.appendChild(line);
      lines.push(line);
      updateLines();
    }
  }
  let circle = createCircle(point);
  svg.appendChild(circle);
  circles.push(circle);

  if (isClosedPolygon() && points.length !== 1) {
    updatePolygon();
    closePolygon();
  }
}

function createCircle(point) {
  let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", point.x);
  circle.setAttribute("cy", point.y);
  circle.setAttribute("r", 5);
  circle.setAttribute("fill", "red");
  circle.setAttribute("stroke", "black");
  circle.addEventListener("mousedown", startDrag);
  return circle;
}

function isClosedPolygon() {
  let firstPoint = points[0];
  let lastPoint = points[points.length - 1];
  let radius = parseFloat(circles[0].getAttribute("r"));
  let distance = Math.sqrt(Math.pow(lastPoint.x - firstPoint.x, 2) + Math.pow(lastPoint.y - firstPoint.y, 2));
  return distance <= radius;
}

function closePolygon() {
  svg.removeEventListener("click", addPoint);
}

function updateLines() {
  lines.forEach((line, index) => {
    if (index < points.length - 1) {
      line.setAttribute("x1", points[index].x);
      line.setAttribute("y1", points[index].y);
      line.setAttribute("x2", points[index + 1].x);
      line.setAttribute("y2", points[index + 1].y);
    }
  });
}

function startDrag(event) {
  let circle = event.target;
  let index = circles.indexOf(circle);
  if (index !== -1) {
    let initialX = event.clientX;
    let initialY = event.clientY;
    function move(event) {
      let deltaX = event.clientX - initialX;
      let deltaY = event.clientY - initialY;
      points[index].x += deltaX;
      points[index].y += deltaY;
      circle.setAttribute("cx", points[index].x);
      circle.setAttribute("cy", points[index].y);
      updateLines();
      updatePolygon();
      initialX = event.clientX;
      initialY = event.clientY;
    }
    function stopDrag() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stopDrag);
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stopDrag);
  }
}

svg.addEventListener("click", addPoint);





document.getElementById('convertBtn').addEventListener('click', function () {
  document.getElementById('loader-overlay').classList.add('show');
  let polygon = svg.querySelector('polygon');
  let points = polygon.getAttribute('points').split(' ');

  if (points.length) {


    function svgPolygonToArray(svg) {
      const svgWidth = svg.getAttribute('width');
      const svgHeight = svg.getAttribute('height');
      const polygon = svg.querySelector('polygon');
      const points = polygon.getAttribute('points').split(' ');


      const array = Array.from({ length: parseInt(svgHeight) }, () => Array(parseInt(svgWidth)).fill(null));


      for (let y = 0; y < parseInt(svgHeight); y++) {
        for (let x = 0; x < parseInt(svgWidth); x++) {
          if (isPointInsidePolygon(x, y, points)) {
            array[y][x] = 100;
          } else {
            array[y][x] = NaN;
          }
        }
      }

      return array;
    }


    function isPointInsidePolygon(x, y, points) {
      let inside = false;
      let j = points.length - 1;
      for (let i = 0; i < points.length; i++) {
        const xi = parseFloat(points[i].split(',')[0]);
        const yi = parseFloat(points[i].split(',')[1]);
        const xj = parseFloat(points[j].split(',')[0]);
        const yj = parseFloat(points[j].split(',')[1]);

        const intersect = ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
        j = i;
      }
      return inside;
    }

    const z_data = svgPolygonToArray(svg);


    z_data.reverse()


    var flatZData = z_data.flat().filter(value => !isNaN(value));
    console.log('Flat Z Data:', flatZData);



    function findMinMax(array) {
      let min = Infinity;
      let max = -Infinity;

      for (let i = 0; i < array.length; i++) {
        const value = array[i];
        if (!isNaN(value)) {
          if (value < min) {
            min = value;
          }
          if (value > max) {
            max = value;
          }
        }
      }

      return { min, max };
    }

    const { min_z, max_z } = findMinMax(flatZData);

    console.log('Minimum value:', min_z);
    console.log('Maximum value:', max_z);

    console.log("z_data", z_data)

    function createArray(rows, cols, value) {
      var newArray = [];
      for (var i = 0; i < rows; i++) {
        var row = [];
        for (var j = 0; j < cols; j++) {
          row.push(value);
        }
        newArray.push(row);
      }
      return newArray;
    }

    var numRows = z_data.length;
    var numCols = z_data[0].length;


    console.log("numRows", numRows)
    console.log("numCols", numCols)

    var newArray = createArray(numRows, numCols, 0);

    for (var i = 0; i < numRows; i++) {
      for (var j = 0; j < numCols; j++) {
        if (i === 0 || i === numRows - 1 || j === 0 || j === numCols - 1 || isNaN(z_data[i][j])) {
          newArray[i][j] = z_data[i][j];
        }
      }
    }

    for (var i = 1; i < numRows - 1; i++) {
      for (var j = 1; j < numCols - 1; j++) {
        if (isNaN(newArray[i - 1][j]) || isNaN(newArray[i + 1][j]) || isNaN(newArray[i][j - 1]) || isNaN(newArray[i][j + 1]) || isNaN(newArray[i - 1][j - 1]) || isNaN(newArray[i - 1][j + 1]) || isNaN(newArray[i + 1][j - 1]) || isNaN(newArray[i + 1][j + 1])) {
          newArray[i][j] = z_data[i][j];
        }
      }
    }

    console.log("newArray", newArray);

    const minX = 0;
    const maxX = 10;
    const minY = 0;
    const maxY = 10;


    const xValues = [];
    const yValues = [];

    const stepX = (maxX - minX) / (numCols - 1);
    const stepY = (maxY - minY) / (numRows - 1);

    for (let i = 0; i < numRows; i++) {
      const rowXValues = [];
      const rowYValues = [];
      for (let j = 0; j < numCols; j++) {
        const x = minX + j * stepX;
        const y = minY + i * stepY;
        rowXValues.push(x);
        rowYValues.push(y);
      }
      xValues.push(rowXValues);
      yValues.push(rowYValues);
    }



    console.log("xValues", xValues)
    console.log("yValues", yValues)

    const colorscale = [
      [0, '#78534a'],
      [0.5, '#b09371'],
      [1, '#cac28a']
    ];

    var data = [{
      type: 'surface',
      z: z_data,
      colorscale: colorscale,
      showscale: false,
      x: xValues,
      y: yValues,
    },
    {
      type: 'surface',
      z: newArray,
      colorscale: colorscale,
      showscale: false,
      x: xValues,
      y: yValues,
    }
    ];

    var squreLayout = {
      title: '',
      scene: {
        xaxis: { visible: false },
        yaxis: { visible: false },
        zaxis: { visible: false },
      },
    };


    Plotly.newPlot('plotlyDiv', data, squreLayout);

    setTimeout(function () {
      document.getElementById('loader-overlay').classList.remove('show');
    }, 2000);
  }
});