<template>
<div id="cont">
    <div class="container-fluid">
        <div class="row justify-content-center">
            <div class="col-md-4 controls">
                <div class="form-group">
                    <div class="pair">
                        <h1>Enter number of Vertices</h1>
                        <input class="col-md-8 form-control" type="text" v-model="numVertices">
                    </div>
                    <div class="pair">
                        <h1>Enter number of Edges</h1>
                        <input class="col-md-8 form-control" type="text" v-model="numEdges">
                    </div>
                    <div class="pair">
                        <h1>Find Path to</h1>
                        <input class="col-md-8 form-control" type="text" v-model="endVertex">
                    </div>
                    <div class="pair">
                        <button class="btn btn-success mt-1" @click="drawGeneratedGraph(numVertices, numEdges, endVertex)">Generate Graph</button>
                    </div>
                    <hr>
                     <div class="pair">
                        <h1>Shortest Path to {{endVertex}}</h1>
                        <table class="table table-striped">
                            <thead>
                            <tr>
                                <th scope="row">Step:</th>
                                <th v-for="el in stepCounter" :key="el">
                                    {{el}}
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr >
                                <th scope="row">Vertex:</th>
                                <td v-for="path in shortestPathTo" :key="path">{{path}}</td>
                            </tr>
                            <tr >
                                <th scope="row">Weights:</th>
                                <td v-for="el in weights" :key="el">{{el}}</td>
                            </tr>
                            <tr>
                                <th scope="row">Result Weight :</th>
                                <td>{{shortestPathWeight}}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <hr>
                    <div class="panel panel-default mt-4">
                        <div class="panel-heading">
                        <h3 class="panel-title">Database</h3>
                        </div>
                        <div class="pair">
                        <table class="table table-striped">
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>Vertices</th>
                                <th>Edges</th>
                                <th>X</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="elem in dalgos" :key="elem">
                                <td>{{elem.date}}</td> 
                                <td><a v-bind:href="elem.numVerts">{{elem.numVerts}}</a></td>
                                <td>{{elem.numEdges}}</td>
                                <td><i class="ion-close-circled" v-on:click="removeDalgo(elem)"></i></td>
                            </tr>
                            </tbody>
                        </table>
                        </div>
                </div>
                </div>
            </div>
            <div class="col-md-7">
                <canvas ref="canvas" width="800" height="500"></canvas>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import Firebase from 'firebase'
import toastr from 'toastr'

// Initialize Firebase
  let config = {
    apiKey: "AIzaSyARKp6S10CAcBkgaILoMCRyWki-fWKmiXw",
    authDomain: "dijkstra-8fea8.firebaseapp.com",
    databaseURL: "https://dijkstra-8fea8.firebaseio.com",
    projectId: "dijkstra-8fea8",
    storageBucket: "",
    messagingSenderId: "158823314420"
  };

let app = Firebase.initializeApp(config, 'dijkstralgo');
let db = app.database();
let dalgosRef = db.ref('dalgos');

export default {
    firebase: {
    dalgos: dalgosRef
    },
  data: function () {
      return {
                stepCounter: [],
                numVertices: '',
                numEdges: '',
                xCenter: 400,
                yCenter: 250,
                protoRadius: 150,
                Vertices: [],
                Connections: [],
                pi : Math.PI,
                smallRadius: 20,
                letterSize: 15,
                endVertex: 0,
                searchResult: [],
                originalVertices: [],
                deviation: null,
                waysWeight: [],
                weights: [],
                shortestPathTo: [],
                shortestPathWeight: "",
                newDalgo: {
                    numVerts: "",
                    numEdges: "",
                    result: "",
                    shortest: "",
                    adj: ""
                }
      }
  },
  methods: {

    addDalgo: function () {
                dalgosRef.push(this.newDalgo);
                this.newDalgo.date = "";
                this.newDalgo.numVerts = "";
                this.newDalgo.numEdges = "";
                this.newDalgo.result = "";
                this.adj = "";
    },

    removeDalgo: function (graph) {
                dalgosRef.child(graph['.key']).remove()
                toastr.success('Information removed successfully')
    },

    stepCount(arr) {
        this.stepCounter = [];
        for(let i = 0; i < arr.length; i++){
            this.stepCounter.push(i);
        }
    },

    originVertices(nVert){
        this.originalVertices = [];
        for(let i = 0; i < nVert; i++){
            this.originalVertices.push(i);
        }
    },

    resizeProto(nVert) {
        this.protoRadius = parseInt(nVert)+180;
        this.smallRadius = 17;
        this.deviation = parseInt(nVert)+15;
    },
    
    drawCircle(x,y,radius){
        let ctx = this.$refs.canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, this.pi * 2, true); // Внешняя окружность
        ctx.strokeStyle = "black";//rgb(43,166,203)
        ctx.fill();
        ctx.closePath();
    },

    drawVertices (nVer, xCenter, yCenter){
        this.resizeProto(nVer);
        this.Vertices = [];
        let ctx = this.$refs.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
        let index = 0;
        for( index = 0; index < nVer; index++){
            let x = (Math.cos(2*this.pi * index /nVer ) * this.protoRadius + 0.5) + xCenter;
            let y = (Math.sin(2*this.pi * index /nVer ) * this.protoRadius + 0.5) + yCenter;
            this.Vertices.push({id:index, x:x, y:y});
            this.drawCircle(x, y, this.smallRadius);
        }
    },

    drawFromAdjMatrix(adjMatrix) {
        this.Connections = [];
        let length = adjMatrix.length;
        this.drawVertices(length, this.xCenter, this.yCenter);
        let connections = [];
        let conCounter = 0;
        for(let index = 0; index < length; index++){
        for(let anindex = 0; anindex < length; anindex++){
            if(adjMatrix[index][anindex]>0){
            connections.push([index, anindex, adjMatrix[index][anindex]]);
            conCounter++;
            }
        }
        }
        for(let i = 0; i < conCounter; i++){
                this.drawPointer(this.Vertices[connections[i][0]], this.Vertices[connections[i][1]]);
        }
        for(let i = 0; i < conCounter; i++){
                    this.drawWeight(connections[i][0], connections[i][1], connections[i][2]);
        }
        this.Connections = connections;
    },

    randomInteger(min, max) {
      let rand = min - 0.5 + Math.random() * (max - min + 1);
      rand = Math.round(rand);
      return rand;
    },

    generateAdjMatrix(numVert, numEdg) {
        if (numVert < 1 || numEdg < 0 || numEdg > numVert * (numVert - 1) / 2) return null;
                    let matrix = [];//numVert, numVert
                    for(let i = 0; i < numVert; i++){
                    let row = [];
                    for (let g = 0; g < numVert; g++) {
                        row.push(0);
                    }
                    matrix.push(row);
                    }
                    let count = 0;
                    function Insert(x,y){
                        if (matrix[x][y] < 1)
                        {
                            let rand = 1 - 0.5 + Math.random() * (9 - 1 + 1);
                            rand = Math.round(rand);
                            matrix[x][y] = rand;
                            matrix[y][x] = rand;
                            //removed = matrix[y][x]
                            count++;
                            return true;
                        }
                        return false;
                    }
                    while (count < numEdg)
                    {
                        let x = this.randomInteger(0, numVert-1);
                        let y = this.randomInteger(0, numVert-1);
                        if (x != y)
                        {
                            if (x < y)
                            {
                                let temp = x;
                                x = y;
                                y = temp;
                            }
                            if (!Insert(x, y))
                                while (x < ++y && !Insert(x, y))
                                    ;
                        }
                    }
                    return matrix;
    },

    assignLetterToVertex(vertex, letterSize) {
        let id = vertex.id;
        let x = vertex.x;
        let y = vertex.y;
        let ctx = this.$refs.canvas.getContext('2d');
        ctx.beginPath();
        ctx.font = `${letterSize}px Montserrat`;
        ctx.fillStyle = "white";
        let name = id.toString();
        ctx.fillText(name,x,y);//stroke
        ctx.closePath();
        //WARNING
        ctx.fillStyle = "black";
    },

    drawPointer(circle1, circle2) {
        let ptCirle1 = this.getPointOnCircle(18, circle1, circle2);
        let ptCircle2 = this.getPointOnCircle(18, circle2, circle1);
        let arrow = { h: 3, w: 5 };
        let ptArrow = this.getPointOnCircle(18 + arrow.w, circle2, circle1);
        this.drawLine(ptCirle1, ptCircle2);
        this.drawArrow(arrow, ptArrow, ptCircle2);
    },

    drawArrow(arrow, ptArrow, endPt) {
        let canvasContext = this.$refs.canvas.getContext('2d');
        let angleInDegrees = this.getAngleBetweenPoints(ptArrow, endPt);
        //WARNING
        canvasContext.save();
        canvasContext.translate(ptArrow.x, ptArrow.y);
        canvasContext.rotate(angleInDegrees * Math.PI / 180);
        canvasContext.beginPath();
        canvasContext.moveTo(0, 0);
        canvasContext.lineTo(0, -arrow.h);
        canvasContext.lineTo(arrow.w, 0);
        canvasContext.lineTo(0, +arrow.h);
        canvasContext.closePath();
        canvasContext.fillStyle = "rgb(72,72,72)";
        canvasContext.stroke();
        canvasContext.fill();
        canvasContext.restore();
    },

    drawLine(startPt, endPt) {
        let canvasContext = this.$refs.canvas.getContext('2d');
        canvasContext.beginPath();
        canvasContext.moveTo(startPt.x, startPt.y);
        canvasContext.lineTo(endPt.x, endPt.y);
        canvasContext.stroke();
        canvasContext.closePath();
    },

    drawLineRed(startPt, endPt) {
        let canvasContext = this.$refs.canvas.getContext('2d');
        canvasContext.beginPath();
        canvasContext.fillStroke = "red";
        canvasContext.moveTo(startPt.x, startPt.y);
        canvasContext.lineTo(endPt.x, endPt.y);
        canvasContext.stroke();
        canvasContext.closePath();
    },

    getPointOnCircle(radius, originPt, endPt) {
        var angleInDegrees = this.getAngleBetweenPoints(originPt, endPt);
        // Convert from degrees to radians via multiplication by PI/180
        var x = radius * Math.cos(angleInDegrees * Math.PI / 180) + originPt.x;
        var y = radius * Math.sin(angleInDegrees * Math.PI / 180) + originPt.y;
        return { x: x, y: y };
    },

    getAngleBetweenPoints(originPt, endPt) {
        let interPt = {
            x: endPt.x - originPt.x,
            y: endPt.y - originPt.y
        };
        return Math.atan2(interPt.y, interPt.x) * 180 / Math.PI;
    },

    drawWeight(va, vb, weight) {
        let x = (this.Vertices[va].x + this.Vertices[vb].x)/2;
        let y = (this.Vertices[va].y + this.Vertices[vb].y)/2;
        this.drawCircle(x, y, 3);
        let xd = x;
        let yd = y;
        let ctx = this.$refs.canvas.getContext('2d');
        ctx.beginPath();
        ctx.font = `${this.letterSize+5}px Axis`;
        ctx.fillStyle = "red";
        ctx.fillText(weight.toString(),xd,yd);//stroke
        ctx.closePath();
        ctx.fillStyle="black";
    },

    drawGeneratedGraph(numVert, numEdg, root) {
        this.resizeProto(numVert);
        this.Vertices = [];
        this.shortestPathTo = [];
        this.shortestPathWeight = "";
        this.waysWeight = [];
        let ctx = this.$refs.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
        let adjMatrix = this.generateAdjMatrix(numVert, numEdg);
        console.log(adjMatrix);
        this.drawFromAdjMatrix(adjMatrix);
        
        //console.log(this.path(adjMatrix, numVert, root));
        this.shortestPathTo = this.path(adjMatrix, numVert, root).shortest;
        this.stepCount(this.path(adjMatrix, numVert, root).shortest);
        //this.shortestPathWeight = this.path(adjMatrix, numVert, root).ways[root];
        this.waysWeight = this.path(adjMatrix, numVert, root).ways;
        this.originVertices(numVert);
        this.newDalgo.adj = "";
        for(let i = 0; i < this.Vertices.length; i++){
            this.assignLetterToVertex(this.Vertices[i], this.letterSize);
        }
         let today = new Date();
            let dd = today.getDate();
            let mm = today.getMonth()+1;
            var yyyy = today.getFullYear();
            if(dd<10){
                dd='0'+dd;
            } 
            if(mm<10){
                mm='0'+mm;
            } 
            today = dd+'/'+mm+'/'+yyyy;
        this.newDalgo.date = dd+'/'+mm+'/'+yyyy;
        this.newDalgo.numVerts = numVert.toString();
        this.newDalgo.numEdges = numEdg.toString();
        this.newDalgo.result = this.path(adjMatrix, numVert, root).ways.toString();
        this.newDalgo.shortest = "to " + this.endVertex.toString() + " = " + this.path(adjMatrix, numVert, root).shortest;
        
        let stringWeights = "";
        this.weights = [];
        for(let i = 0; i < this.path(adjMatrix, numVert, root).shortest.length-1; i++){
            let a = this.path(adjMatrix, numVert, root).shortest[i];
            let b = this.path(adjMatrix, numVert, root).shortest[i+1];
            this.weights.push(adjMatrix[a][b])
            stringWeights += adjMatrix[a][b] + "      ";
        }
        this.shortestPathWeight = this.path(adjMatrix, numVert, root).ways[root];
        for(let i = 0; i < adjMatrix.length; i++){
            for(let j = 0; j < adjMatrix[i].length; j++){
                this.newDalgo.adj += adjMatrix[i][j].toString() + " ";
            }    
            this.newDalgo.adj += '\r\n';
        }
        this.addDalgo();
    },

    path(a, nVert, end) {
        // let a = []; // матрица связей
        let d = []; // минимальное расстояние
        let v = []; // посещенные вершины
        let temp;
        let minindex, min;

        // Инициализация матрицы связей
        // for (let i = 0; i<nVert; i++)
        // {
        //   a[i][i] = 0;
        //   // for (int j = i + 1; j<nVert; j++) {
        //   //   printf("Введите расстояние %d - %d: ", i + 1, j + 1);
        //   //   scanf("%d", &temp);
        //   //   a[i][j] = temp;
        //   //   a[j][i] = temp;
        //   // }
        // }
        // Вывод матрицы связей
            //console.log(a);
        //Инициализация вершин и расстояний
        for (let i = 0; i<nVert; i++)
        {
            d[i] = 10000;
            v[i] = 1;
        }
        d[0] = 0;
        // Шаг алгоритма
        do {
            minindex = 10000;
            min = 10000;
            for (let i = 0; i<nVert; i++)
            { // Если вершину ещё не обошли и вес меньше min
            if ((v[i] == 1) && (d[i]<min))
            { // Переприсваиваем значения
                min = d[i];
                minindex = i;
            }
            }
            // Добавляем найденный минимальный вес
            // к текущему весу вершины
            // и сравниваем с текущим минимальным весом вершины
            if (minindex != 10000)
            {
            for (let i = 0; i<nVert; i++)
            {
                if (a[minindex][i] > 0)
                {
                temp = min + a[minindex][i];
                if (temp < d[i])
                {
                    d[i] = temp;
                }
                }
            }
            v[minindex] = 0;
            }
        } while (minindex < 10000);
        // Вывод кратчайших расстояний до вершин

        //Восстановление пути
        let ver = []; // массив посещенных вершин
        // let end = 4; // индекс конечной вершины = 5 - 1
        ver[0] = parseInt(end); // начальный элемент - конечная вершина
        let k = 1; // индекс предыдущей вершины
        let weight = d[end]; // вес конечной вершины

        while (end > 0) // пока не дошли до начальной вершины
        {
            for(let i=0; i<nVert; i++) // просматриваем все вершины
            if (a[end][i] != 0)   // если связь есть
            {
                let temp = weight - a[end][i]; // определяем вес пути из предыдущей вершины
                if (temp == d[i]) // если вес совпал с рассчитанным
                {                 // значит из этой вершины и был переход
                weight = temp; // сохраняем новый вес
                end = i;       // сохраняем предыдущую вершину
                ver[k] = i; // и записываем ее в массив
                k++;
                }
            }
        }
        // Вывод пути (начальная вершина оказалась в конце массива из k элементов)
        let shortestto = [];
        for (let i = k-1; i>=0; i--){
        shortestto.push(ver[i]);
        //console.log(ver[i]);
        }

        let res = {
            ways: d,
            shortest: shortestto
        };
        return res;
    }
  }
}
</script>

<style scoped>
@import "http://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css";
    #cont{
            margin-top: 6rem;
        }
    .main-label{
        font-size: 1.5rem;
        font-family: "Open Sans";
        font-weight: 500;
        margin-top: 1.5rem;
        margin-left: 5rem;
    }
    h1{
        font-size: 12px;
        padding: 7px;
    }

    .tabled{
        background-color: whitesmoke;
        border-radius: 5px;
        color: black;
        border-radius: 5px;
        /* box-shadow: 0 2px 2px rgba(0, 0, 0, .5); */
        margin-bottom: 10px;
    }

    td{
        padding: 10px;
    }

    .form-group{
        padding: 8px;
        background-color: whitesmoke;
        border-radius: 5px;
    }
    .controls{
        font-family: "Open Sans";
        margin-top: 20px;
        margin-left: 10px;
        font-size: 12px;
        background-color: whitesmoke;
        color: black;
        border-radius: 5px;
        /* box-shadow: 0 2px 2px rgba(0, 0, 0, .5);  */
    }
    .pair{
        font-size: 12px;
        font-weight: 700;
        padding: 5px;
    }
    .pair h1{
        font-size: 12px;
        font-weight: 700;
    }
</style>
