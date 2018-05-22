<template>
<div id="cont">
    <div class="container-fluid">
        <!-- <h1 class="main-label">breadth first search - aisd</h1> -->
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
                        <h1>Root Edge</h1>
                        <input class="col-md-8 form-control" type="text" v-model="startVertex" disabled>
                    </div>
                    <div class="pair">
                        <button class="btn btn-success mt-1" @click="makeCompleteFromGeneration(numVertices, numEdges, letterSize, startVertex)">Generate Graph</button>
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
                            <tr v-for="graph in graphs" :key="graph">
                                <td>{{graph.date}}</td> 
                                <td><a v-bind:href="graph.numVerts">{{graph.numVerts}}</a></td>
                                <td>{{graph.numEdges}}</td>
                                <td><i class="ion-close-circled" v-on:click="removeGraph(graph)"></i></td>
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
        <div class="row justify-content-center mt-5">    
            <div class="col-md-10 tabled">
                <div class="pair">
                        <table class="table table-striped table-hover mt-3">
                            <tbody>
                            <tr>
                            <th scope="row">Search result:</th>
                            <td v-for="element in searchResult" :key="element">{{ element }}</td>
                            </tr>
                            <tr>
                            <th scope="row">Steps:</th>
                            <td v-for="origin in originalVertices" :key="origin">{{ origin }}</td>
                            </tr>
                            <tr>
                            <th scope="row">Previous vertices:</th>
                            <td v-for="prevelement in searchPrevResult" :key="prevelement">{{ prevelement }}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
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
    apiKey: "AIzaSyCuk_qfrDRNDdPs_-RNpAOWNeZdGOk9sOI",
    authDomain: "vuejs-graph-theory.firebaseapp.com",
    databaseURL: "https://vuejs-graph-theory.firebaseio.com",
    projectId: "vuejs-graph-theory",
    storageBucket: "vuejs-graph-theory.appspot.com",
    messagingSenderId: "631220004463"
  };
  
let app = Firebase.initializeApp(config, 'bfs');
let db = app.database();
let graphsRef = db.ref('graphs');

export default {
    firebase: {
    graphs: graphsRef
    },
  data: function () {
      return {
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
                startVertex: 0,
                searchResult: [],
                searchPrevResult: [],
                originalVertices: [],
                deviation: null,
                newGraph: {
                    numVerts: "",
                    numEdges: "",
                    result: "",
                    adj: "",
                    prevs: ""
                }
      }
  },
  methods: {

    addGraph: function () {
                graphsRef.push(this.newGraph);
                this.newGraph.date = "";
                this.newGraph.numVerts = "";
                this.newGraph.numEdges = "";
                this.newGraph.result = "";
                this.adj = "";
                this.prevs = "";
    },

    removeGraph: function (graph) {
                graphsRef.child(graph['.key']).remove()
                toastr.success('Graph removed successfully')
    },

    resizeProto(nVert, numEdges) {
        this.protoRadius = parseInt(nVert)+180;
        this.smallRadius = 17;
        this.deviation = parseInt(nVert)+15;
    },
    
    drawCircle(x,y,radius) {
            let ctx = this.$refs.canvas.getContext('2d');
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, this.pi * 2, true); // Внешняя окружность
            ctx.strokeStyle = "black";//rgb(43,166,203)
            ctx.fill();
            ctx.closePath();
    },

    drawLineFromTo(x0, y0, x1, y1) {
        let ctx = this.$refs.canvas.getContext('2d');
        ctx.beginPath();
        ctx.lineWidth=2;
        ctx.strokeStyle="black";
        ctx.moveTo(x0,y0);
        ctx.lineTo(x1,y1);
        ctx.stroke();
        ctx.closePath();
    },

    drawVertices(nVer, xCenter, yCenter) {
        let index = 0;
        this.Vertices = [];
        for( index = 0; index < nVer; index++){
            let x = (Math.cos(2*this.pi * index /nVer ) * this.protoRadius + 0.5) + xCenter;
            let y = (Math.sin(2*this.pi * index /nVer ) * this.protoRadius + 0.5) + yCenter;
            this.Vertices.push({id:index, x:x, y:y});
            this.drawCircle(x, y, this.smallRadius);
        }
    },

    makeConnection(va, vb) {
        this.drawLineFromTo(this.Vertices[va].x, this.Vertices[va].y, this.Vertices[vb].x, this.Vertices[vb].y);
    },

    drawFromAdjMatrix(adjMatrix) {
        let length = adjMatrix.length;
        this.drawVertices(length, this.xCenter, this.yCenter);
        let connections = [];
        let conCounter = 0;
        for(let index = 0; index < length; index++){
        for(let anindex = index+1; anindex < length; anindex++){
            if(adjMatrix[index][anindex]==1){
            connections.push([index, anindex]);
            conCounter++;
            }
        }
        }
         for(let i = 0; i < connections.length; i++){
            this.makeConnection(connections[i][0],connections[i][1]);
        }
    },

    makeAdjMatrix(numVert, connections) {
        let adjMatrix = [];
        for(let i = 0; i < numVert; i++){
        let row = [];
        for (let g = 0; g < numVert; g++) {
            row.push(0);
        }
        adjMatrix.push(row);
        }
        connections.forEach(function(element){
        adjMatrix[element[0]][element[1]]=1;
        adjMatrix[element[1]][element[0]]=1;
        });
        return adjMatrix;
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
                        if (matrix[x][y] == 0)
                        {
                            matrix[x][y] = matrix[y][x] = 1;
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
                                while (x > ++y && !Insert(x, y))
                                    ;
                        }
                    }
                    return matrix;
        },

        randomInteger(min, max) {
        let rand = min - 0.5 + Math.random() * (max - min + 1)
        rand = Math.round(rand);
        return rand;
        },

        isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
        },

        breadthFirstSearchFromMatrix(graph, root) {
        let nodesLen = {};
        let nums = [];
        for (let i = 0; i < graph.length; i++) {
        nodesLen[i] = Infinity;
        }
        nodesLen[root] = 0;

        let queue = [root];
        let current;
        nums.push(root);
        while (queue.length != 0) {
        current = queue.shift();
        let curConnected = graph[current];
        let neighborIdx = [];
        let idx = curConnected.indexOf(1);
        while (idx != -1) {
            neighborIdx.push(idx);
            if(!nums.includes(idx)){
                nums.push(idx);
            }
            idx = curConnected.indexOf(1, idx + 1);
        }
        for (let j = 0; j < neighborIdx.length; j++) {
            if (nodesLen[neighborIdx[j]] == Infinity) {
            nodesLen[neighborIdx[j]] = nodesLen[current] + 1;
            queue.push(neighborIdx[j]);
            }
        }
        }
        return nums;
    },

    assignResult(vertex, name, letterSize, deviat) {
            let ctx1 = this.$refs.canvas.getContext('2d');
            let id = vertex.id;
            let x = vertex.x-deviat;
            let y = vertex.y-deviat;
            ctx1.beginPath();
            ctx1.font = `${letterSize+10}px Axis`;
            ctx1.fillStyle = "blue";
            ctx1.fillText(name.toString(),x,y);//stroke
            ctx1.closePath();
            ctx1.fillStyle = "black";
    },

    assignLetterToVertex(vertex, letterSize) {
            let ctx = this.$refs.canvas.getContext('2d');
            let id = vertex.id;
            let x = vertex.x;
            let y = vertex.y;
            ctx.beginPath();
            ctx.font = `${letterSize}px Montserrat`;
            ctx.fillStyle = "white";
            let name = id.toString();
            ctx.fillText(name,x,y);//stroke
            ctx.closePath();
    },

    colorVertByResult(adjMatrix, root, letterSize) {
            let resOfBFS = [];
            this.searchResult=[];
            resOfBFS=this.breadthFirstSearchFromMatrix(adjMatrix, root);
            this.newGraph.adj = "";
            
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
            this.newGraph.date = dd+'/'+mm+'/'+yyyy;
            this.newGraph.numVerts = this.numVertices.toString();
            this.newGraph.numEdges = this.numEdges.toString();
            this.newGraph.result = resOfBFS.toString();
            for(let i = 0; i < adjMatrix.length; i++){
                for(let j = 0; j < adjMatrix[i].length; j++){
                    this.newGraph.adj += adjMatrix[i][j].toString() + " ";
                }    
                this.newGraph.adj += '\r\n';
            }
            this.addGraph();
            

            this.searchResult = resOfBFS;
            for(let i = 0; i<resOfBFS.length;i++){
            this.assignResult(this.Vertices[resOfBFS[i]], i , letterSize, this.deviation);
            }
    },

    makeCompleteFromGeneration(numVert, numEdg, letterSize, rootVert) {
            let adjMatrix = this.generateAdjMatrix(numVert, numEdg);
            let ctx = this.$refs.canvas.getContext('2d');
            let tmp_res = this.findPrevSteps(adjMatrix, rootVert);
            this.searchPrevResult = [];
            this.searchPrevResult = tmp_res;
            this.newGraph.prevs = "";
            for(let i = 0; i < numVert; i++) this.newGraph.prevs += tmp_res[i] + " ";
            this.originalVertices=[];
            for(let i = 0; i < numVert; i++) this.originalVertices.push(i);
            
            ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
            this.resizeProto(numVert, numEdg);
            this.drawFromAdjMatrix(adjMatrix);
            for(let i = 0; i < this.Vertices.length; i++){
                this.assignLetterToVertex(this.Vertices[i], letterSize);
            }
            this.colorVertByResult(adjMatrix, rootVert, letterSize); 
    },

    findPrevSteps(graph, root) {
        let nodesLen = {};
        let nums = {};
        for (let i = 0; i < graph.length; i++) {
        nodesLen[i] = Infinity;
        }
        nodesLen[root] = 0;

        let queue = [root];
        let current;

        while (queue.length != 0) {
        current = queue.shift();
        let curConnected = graph[current];
        let neighborIdx = [];
        let idx = curConnected.indexOf(1);
        while (idx != -1) {
        neighborIdx.push(idx);
        // nums.push(idx);
        if(! nums.hasOwnProperty(idx)) nums[idx] = current;
        // else nums[idx] = [current];

        idx = curConnected.indexOf(1, idx + 1);
        }
        for (let j = 0; j < neighborIdx.length; j++) {
        if (nodesLen[neighborIdx[j]] == Infinity) {
        nodesLen[neighborIdx[j]] = nodesLen[current] + 1;
        queue.push(neighborIdx[j]);
        }
        }
        }

        const prevs = [];
        // for(let key in nums) {
        // prevs.push(nums[key]);
        // }
        for (let i = 0; i < graph.length; i++) {
        if(nums.hasOwnProperty(i)) prevs.push(nums[i]);
        else prevs.push(''); 
        }
        prevs[0]="";
        return prevs;
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
        font-family: 'Open Sans';
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
