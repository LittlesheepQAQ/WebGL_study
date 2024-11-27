"use strict"
var canvas;
let gl;
let pig = [];
let vPositionLoc;
let vNormalLoc;
let program;
let NormalMatrix = [];
let modelViewMatrix = [];
let projectMatrix = [];

let modelViewMatrixLoc;
let projectMatrixLoc;
let normalMatrixLoc;
let lightPositionLoc;

let theta = 0;
let phi = 0;

// 摄像机参数
let eye = [0, 0, 1];
let at = [0, 0, 0];
let up = [0, 1, 0];

//取景框
let m_top = 6;
let bottom = -6;
let left = -6;
let right = 6;
let near = -10;
let far = 10;

var lightPosition = vec4(-4, 0, 4, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;
const speed = 0.1; // 移动速度

class cube {
    points = [];
    position = [0, 0, 0];
    indexArray = [
        0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4,
        3, 6, 2, 3, 7, 6, 1, 6, 5, 1, 2, 6, 0, 7, 3, 0, 4, 7
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
            [1, 1, 1], //0
            [1, -1, 1], //1
            [-1, -1, 1], // 2
            [-1, 1, 1], //3
            [1, 1, -1], // 4
            [1, -1, -1],// 5
            [-1, -1, -1],// 6
            [-1,  1, -1]//7  
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
        for(var i = 0; i < this.indexArray.length; i++) {
            pointsArray.push(this.points[this.indexArray[i]]);
        }
        return pointsArray;
    }

    getNormalsArray() {
        var normalsArray = [];
        for(var i = 0; i < this.indexArray.length /3; i++){
            var normal = cross(this.vec3Minus(this.points[this.indexArray[i * 3 + 1]], this.points[this.indexArray[i * 3]]), 
                this.vec3Minus(this.points[this.indexArray[i * 3 + 2]], this.points[this.indexArray[i * 3]]));
            normal = normalize(normal);
            normalsArray.push(normal);
            normalsArray.push(normal);
            normalsArray.push(normal);
        }
        return normalsArray;
    }
    move(dx, dy, dz) {
    
        for (var i = 0; i < this.points.length; i++) {
            this.points[i][0] +=  dx;
            this.points[i][1] +=  dy;
            this.points[i][2] +=  dz;
        }
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

function handleKeyPress(event) {
  
    if (event.key === 'D' || event.key === 'd') {
            pig[7].move(speed, 0, 0); // 向前移动
            lightPosition[0]+=speed;
    } else if (event.key === 'A' || event.key === 'a') {
      
            pig[7].move(-speed, 0, 0); // 向后移动
            lightPosition[0]+=-speed;
    }
    else if (event.key === 'S' || event.key === 's') {
    
            pig[7].move(0, -speed, 0); // 向后移动
            lightPosition[1]-=speed;
    }
    else if (event.key === 'w' || event.key === 'W') {
            pig[7].move(0, speed, 0); // 向后移动
            lightPosition[1]+=speed;
    }
    else if (event.key === 'q' || event.key === 'Q'){
        theta -= 0.1 * Math.PI;
        eye = [Math.cos(phi)*Math.sin(theta), Math.sin(phi), Math.cos(theta)*Math.cos(phi)];
        //视角矩阵
        modelViewMatrix = lookAt(eye, at, up);
        NormalMatrix = normalMatrix(modelViewMatrix, true);
    }
    else if (event.key === 'e' || event.key === 'E'){
        theta += 0.1 * Math.PI;
        eye = [Math.cos(phi)*Math.sin(theta), Math.sin(phi), Math.cos(theta)*Math.cos(phi)];
        //视角矩阵
        modelViewMatrix = lookAt(eye, at, up);
        NormalMatrix = normalMatrix(modelViewMatrix, true);
    }
    else if (event.key === 'z' || event.key === 'Z'){
        phi -= 0.1 * Math.PI;
        eye = [Math.cos(phi)*Math.sin(theta), Math.sin(phi), Math.cos(theta)*Math.cos(phi)];
        //视角矩阵
        modelViewMatrix = lookAt(eye, at, up);
        NormalMatrix = normalMatrix(modelViewMatrix, true);
    }
    else if (event.key === 'c' || event.key === 'C'){
        phi += 0.1 * Math.PI;
        eye = [Math.cos(phi)*Math.sin(theta), Math.sin(phi), Math.cos(theta)*Math.cos(phi)];
        //视角矩阵
        modelViewMatrix = lookAt(eye, at, up);
        NormalMatrix = normalMatrix(modelViewMatrix, true);
    }
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(NormalMatrix));
    gl.uniform4fv( gl.getUniformLocation(program,
        "ulightPosition"),flatten(lightPosition) );
    drawPig(); // 重新绘制小猪
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
    let my_cube = new cube(0.5, 0.5, 0.5, -4, 0, 0);
    pig.push(head);
    pig.push(body);
    pig.push(leg1);
    pig.push(leg2);
    pig.push(leg3);
    pig.push(leg4);
    pig.push(nose);
    pig.push(my_cube);
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
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    eye = [Math.cos(phi)*Math.sin(theta), Math.sin(phi), Math.cos(theta)*Math.cos(phi)];
    //视角矩阵
    modelViewMatrix = lookAt(eye, at, up);

    //normalMatrix是modelViewMatrix的子矩阵转置之后取逆
    NormalMatrix = normalMatrix(modelViewMatrix, true);

    //投影矩阵
    projectMatrix = ortho(left, right, bottom, m_top, near, far);

    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    

    gl.uniform4fv( gl.getUniformLocation(program,
        "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
        "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
        "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
        "ulightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,
        "shininess"),materialShininess );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectMatrixLoc, false, flatten(projectMatrix));
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(NormalMatrix));
        
    window.addEventListener('keydown', handleKeyPress);
    drawPig();
}