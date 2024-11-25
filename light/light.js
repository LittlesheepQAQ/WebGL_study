"use strict"
var canvas;
let gl;
let pig = [];
let vPositionLoc;

// 摄像机参数
eye = [0, 0, 1];
at = [0, 0, 0];
up = [0, 1, 0];

class cube {
    points = [];
    indexArray = [
        0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4,
        3, 2, 6, 3, 6, 7, 1, 5, 6, 1, 6, 2, 0, 3, 7, 0, 7, 4
    ]

    vec3Minus(A , B){
        var res = [];
        for(var i = 0; i < 3; i++){
            res.push(A[i] - B[i]);
        }
        return res;
    }

    constructor(x_scale = 1, y_scale = 1, z_scale = 1, x_offset = 0, y_offset = 0, z_offset = 0) {
        // 顶点坐标
        this.points = [
            [1, 1, 1],
            [1, 1, -1],
            [-1, 1, -1],
            [-1, 1, 1],
            [1, -1, 1],
            [1, -1, -1],
            [-1, -1, -1],
            [-1, -1, 1]
        ];
        this.x_scale = x_scale;
        this.y_scale = y_scale;
        this.z_scale = z_scale;
        this.x_offset = x_offset;
        this.y_offset = y_offset;
        this.z_offset = z_offset;

        for (var i = 0; i < this.points.length; i++) {
            this.points[i][0] = this.points[i][0] * x_scale + x_offset;
            this.points[i][1] = this.points[i][1] * y_scale + y_offset;
            this.points[i][2] = this.points[i][2] * z_scale + z_offset;
        }
    }

    getPointsArray() {
        var pointsArray = [];
        for(i in pointsArray) {
            pointsArray.push(points[i]);
        }
    }

    getNormalsArray() {
        var normalsArray = [];
        for(var i = 0; i < this.points.length /3; i++){
            var A_normal = cross(this.vec3Minus(points[i * 3 + 1], point[i * 3]), 
                this.vec3Minus(points[i * 3 + 2], points[i * 3]));
            var B_normal = cross(this.vec3Minus(points[i * 3 + 2], points[i * 3 + 1]), 
                this.vec3Minus(points[i * 3], points[i * 3 + 1]));
            var C_normal = cross(this.vec3Minus(points[i * 3], points[i * 3 + 2]),
                this.vec3Minus(points[i * 3 + 1], points[i * 3 + 2]));
            normalsArray.push(A_normal);
            normalsArray.push(B_normal);
            normalsArray.push(C_normal);
        }
        return normalsArray;
    }

    draw() {
        var pointsArray = this.getPointsArray();
        var normalArray = this.getNormalsArray();

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
        
        vPositionLoc = gl.getAttribLocation(program, "vPosition");
        gl.enableVertexAttribArray(vPositionLoc);
        gl.vertexAttribPointer(vPositionLoc, 3, gl.FLOAT, false, 0, 0);

        var nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalArray), gl.STATIC_DRAW);

        vNormalLoc = gl.getAttribLocation(program, "vNormal");
        gl.enableVertexAttribArray(vNormalLoc);
        gl.vertexAttribPointer(vNormalLoc, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}


// 猪的初始化
function initPig() {
    let head = new cube(0.9, 0.9, 0.9, 2, 0, 0.9);
    let body = new cube(1.6, 1, 0.9, 0, 0, 0.4);
    let leg1 = new cube(0.3, 0.3, 0.7, -1.25, -0.7, -0.6);
    let leg2 = new cube(0.3, 0.3, 0.7, 1.25, -0.7, -0.7);
    let leg3 = new cube(0.3, 0.3, 0.7, 1.25, 0.7, -0.7);
    let leg4 = new cube(0.3, 0.3, 0.7, -1.25, 0.7, -0.6);
    let nose = new cube(0.2, 0.4, 0.28, 2.9, 0, 0.6);
    pig.push(head);
    pig.push(body);
    pig.push(leg1);
    pig.push(leg2);
    pig.push(leg3);
    pig.push(leg4);
    pig.push(nose);
}

// 绘制猪
function drawPig() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (var i = 0; i < pig.length; i++) {
        pig[i].draw();
    }
}
window.onload = function init() {
    initPig();
    canvas = document.getElementById("canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) alert("WebGL isn’t available");
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    

    drawPig();
}