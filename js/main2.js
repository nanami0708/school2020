var camera, scene, renderer;
init();
animate();
function init() {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0, - 400, 600);
  var controls = new THREE.OrbitControls(camera);
  controls.target.set(0, 0, 0);
  controls.update();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  var loader = new THREE.FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    var xMid, text;
    var color = '#124dae';
    var matDark = new THREE.LineBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    });
    var matLite = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    var message = "           CRESCO\nAdventcalendar 2018";
    var shapes = font.generateShapes(message, 100);
    var geometry = new THREE.ShapeBufferGeometry(shapes);
    geometry.computeBoundingBox();
    xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
    geometry.translate(xMid, 0, 0);
    // make shape ( N.B. edge view not visible )
    text = new THREE.Mesh(geometry, matLite);
    text.position.z = - 150;
    scene.add(text);
    // make line shape ( N.B. edge view remains visible )
    var holeShapes = [];
    for (var i = 0; i < shapes.length; i++) {
      var shape = shapes[i];
      if (shape.holes && shape.holes.length > 0) {
        for (var j = 0; j < shape.holes.length; j++) {
          var hole = shape.holes[j];
          holeShapes.push(hole);
        }
      }
    }
    shapes.push.apply(shapes, holeShapes);
    var lineText = new THREE.Object3D();
    for (var i = 0; i < shapes.length; i++) {
      var shape = shapes[i];
      var points = shape.getPoints();
      var geometry = new THREE.BufferGeometry().setFromPoints(points);
      geometry.translate(xMid, 0, 0);
      var lineMesh = new THREE.Line(geometry, matDark);
      lineText.add(lineMesh);
    }
    scene.add(lineText);
  }); //end load function
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);
} // end init
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
  requestAnimationFrame(animate);
  render();
}
function render() {
  renderer.render(scene, camera);
}