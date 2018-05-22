<template>
    <div id="cont">
        <div class="container-fluid">
            <!-- <h1 class="main-label" style="font-family:'axis'; font-size: 20px">minimum spanning tree</h1> -->
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
                            <button class="btn btn-success mt-1" @click="makeCompleteFromGeneration(numVertices, numEdges, letterSize, startVertex)">Generate Graph</button>
                        </div>
                        <hr>
                        <div class="pair">
                            <h1>Minmal Spanning Tree</h1>
                            <table class="table table-striped">
                                <!-- <thead>
                                <tr>
                                    <th scope="row">Step:</th>
                                    <th v-for="el in stepCounter" :key="el">
                                        {{el}}
                                    </th>
                                </tr>
                                </thead> -->
                                <tbody>
                                <tr >
                                    <th scope="row">Weight of Edge:</th>
                                    <td v-for="el in edgesWeight" :key="el">{{el}}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Weight :</th>
                                    <td>{{treeWeight}}</td>
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
                                <tr v-for="elem in mst" :key="elem">
                                    <td>{{elem.date}}</td> 
                                    <td><a v-bind:href="elem.numVerts">{{elem.numVerts}}</a></td>
                                    <td>{{elem.numEdges}}</td>
                                    <td><i class="ion-close-circled" v-on:click="removemst(elem)"></i></td>
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
   apiKey: "AIzaSyB6luRa01QbRzj3bPGkqDOPpy2ry8J-E4E",
    authDomain: "prim-mst.firebaseapp.com",
    databaseURL: "https://prim-mst.firebaseio.com",
    projectId: "prim-mst",
    storageBucket: "",
    messagingSenderId: "871423574872"
  };
  
let app = Firebase.initializeApp(config, 'mstalgo');
let db = app.database();
let mstRef = db.ref('mst');

export default {
    firebase: {
    mst: mstRef
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
                originalVertices: [],
                deviation: null,
                treeWeight: 0,
                edgesWeight: [],
                newTree: {
                    numVerts: "",
                    numEdges: "",
                    adj: "",
                    weight: "",
                    edgweight: ""
                }
      }
  },
  methods: {

    addmst: function () {
                mstRef.push(this.newTree);
                this.newTree.date = "";
                this.newTree.numVerts = "";
                this.newTree.numEdges = "";
                this.newTree.adj = "";
                this.newTree.weight = "";
                this.newTree.edgweight = "";
    },

    removemst: function (graph) {
                mstRef.child(graph['.key']).remove()
                toastr.success('Information removed successfully')
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
            //ctx.fillStyle = "black";
    },

    drawLineFromTo(x0, y0, x1, y1) {
        let ctx = this.$refs.canvas.getContext('2d');
        ctx.beginPath();
        ctx.lineWidth=2;
        ctx.strokeStyle="grey";
        ctx.moveTo(x0,y0);
        ctx.lineTo(x1,y1);
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = "black";
    },

    drawLineFromToGreen(x0, y0, x1, y1) {
        let ctx = this.$refs.canvas.getContext('2d');
        ctx.beginPath();
        ctx.lineWidth=3;
        ctx.strokeStyle="blue";
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
            //this.drawCircle(x, y, this.smallRadius);
        }
    },

    drawProtoVertices(nVer, xCenter, yCenter) {
        let index = 0;
        for( index = 0; index < nVer; index++){
            let x = (Math.cos(2*this.pi * index /nVer ) * this.protoRadius + 0.5) + xCenter;
            let y = (Math.sin(2*this.pi * index /nVer ) * this.protoRadius + 0.5) + yCenter;
            this.drawCircle(x, y, this.smallRadius);
        }
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
        ctx.fillStyle = "black";
        ctx.fillText(weight.toString(),xd,yd);//stroke
        ctx.closePath();
        ctx.fillStyle="black";
    },

    makeConnection(va, vb) {
        this.drawLineFromTo(this.Vertices[va].x, this.Vertices[va].y, this.Vertices[vb].x, this.Vertices[vb].y);
    },

    makeConnectionGreen(va, vb) {
        this.drawLineFromToGreen(this.Vertices[va].x, this.Vertices[va].y, this.Vertices[vb].x, this.Vertices[vb].y);
    },

    drawFromAdjMatrix(adjMatrix) {
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
         for(let i = 0; i < connections.length; i++){
            this.makeConnection(connections[i][0],connections[i][1]);
        }
        for(let i = 0; i < conCounter; i++){
                    this.drawWeight(connections[i][0], connections[i][1], connections[i][2]);
        }
        //this.drawVerticesWithoutPush(length, this.xCenter, this.yCenter);
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
                            let rand = 2 - 0.5 + Math.random() * (9 - 2 + 1);
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
            ctx.fillStyle="black";
    },

    makeArray(w, h, val) {
        var arr = [];
        for(let i = 0; i < h; i++) {
            arr[i] = [];
            for(let j = 0; j < w; j++) {
                arr[i][j] = val;
            }
        }
        return arr;
    },

    makeCompleteFromGeneration(numVert, numEdg, letterSize, rootVert) {
            this.Vertices = [];
            
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
            this.newTree.date = dd+'/'+mm+'/'+yyyy;
            this.newTree.numVerts = numVert.toString();
            this.newTree.numEdges = numEdg.toString();

            this.treeWeight = 0;
            this.edgesWeight = [];

            let adjMatrix = this.generateAdjMatrix(numVert, numEdg);
            let ctx = this.$refs.canvas.getContext('2d');
            this.originalVertices=[];
            for(let i = 0; i < numVert; i++) this.originalVertices.push(i);
            
            ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
            this.resizeProto(numVert, numEdg);
            this.drawFromAdjMatrix(adjMatrix);
            
            //drawing connections
            let pr = (this.primsAlgo(numVert, adjMatrix));      
            for(let i = 0; i < pr.length; i++){
                this.makeConnectionGreen(pr[i][0], pr[i][1]);
            }
            //drawing graph
            this.drawProtoVertices(numVert, this.xCenter, this.yCenter);
            for(let i = 0; i < this.Vertices.length; i++){
                this.assignLetterToVertex(this.Vertices[i], letterSize);
            }
            for(let i = 0; i < adjMatrix.length; i++){
            for(let j = 0; j < adjMatrix[i].length; j++){
                this.newTree.adj += adjMatrix[i][j].toString() + " ";
            }    
            this.newTree.adj += '\r\n';
        }
        this.addmst();
            //console.log(this.treeWeight);
    },

    primsAlgo(n, g){
        for(let i = 0; i < n; i++){
            for(let j = 0; j < n; j++){
                if(g[i][j]==0) g[i][j] = Infinity;
            }
        }
        let anyweight = [];
        let prim = [];
        let weight = 0;
        let used = [n]; for(let i = 0; i < n; i++) used[i] = false;
        let min_e = [n]; //inf
        for(let i = 0; i < n; i++) min_e[i] = Infinity;
        let sel_e = [n]; //-1
        for(let i = 0; i < n; i++) sel_e[i] = -1;
        min_e[0] = 0;

        for (let i=0; i<n; ++i) {
            let v = -1;
            for (let j=0; j<n; ++j)
                if (!used[j] && (v == -1 || min_e[j] < min_e[v]))
                    v = j;
            if (min_e[v] == Infinity) {
                console.log( "No MST!" );
            }

            used[v] = true;
            if (sel_e[v] != -1){
                //console.log( v + " " + sel_e[v]);

            weight += min_e[v];
            anyweight.push(min_e[v]);
            prim.push([v,sel_e[v]]);
            }
            for (let to=0; to<n; ++to)
                if (g[v][to] < min_e[to]) {
                    min_e[to] = g[v][to];
                    sel_e[to] = v;
                }
        }
        this.treeWeight = weight;
        this.edgesWeight = anyweight;
        for(let i = 0; i < anyweight.length; i++) this.newTree.edgweight += anyweight[i] + " ";
        this.newTree.weight = weight;
        return prim;
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
        box-shadow: 0 2px 2px rgba(0, 0, 0, .5);
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
        margin-bottom: 50px;
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
