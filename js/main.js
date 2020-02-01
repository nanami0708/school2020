window.addEventListener('load', init);

function init() {
  //canvasに描画する要素の大きさ


  window.addEventListener('load', init);
  //この下にコードを記述していきます。
  //サイズを指定

  var width = 400;
  var height = 397;
  // レンダラーを作成
  var renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#myCanvas')
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  // シーンを作成
  var scene = new THREE.Scene();
  // カメラを作成
  var camera = new THREE.PerspectiveCamera(80, width / height, 1, 5000);
  camera.position.set(0, 0, +1000);

  var ambientLight = new THREE.AmbientLight(0xeeeeee, 0.9);
  scene.add(ambientLight)

  var directionalLight = new THREE.DirectionalLight(0xeeeeee, 0.5);
  scene.add(directionalLight);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);

  // 箱を作成
  var geometry = new THREE.BoxGeometry(400, 400, 400);
  var sphere = new THREE.SphereGeometry(200, 30, 30);
  const material2 = new THREE.MeshBasicMaterial({ color: '#A2D7DD' });
  // マテリアルにテクスチャーを設定
  var material = new THREE.MeshNormalMaterial();
  // var material = new THREE.MeshBasicMaterial({ color: '#124dae' });  //素材を変えることができる
  var box = new THREE.Mesh(geometry, material);
  var sphere = new THREE.Mesh(sphere, material2);
  sphere.position.set(-500, 0, 0);

  // scene.add(box);
  // scene.add(sphere);


  // model
  var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log(Math.round(percentComplete, 2) + '% downloaded');
    }
  };

  var onError = function () { };
  var manager = new THREE.LoadingManager();
  manager.addHandler(/\.dds$/i, new THREE.DDSLoader());
  new THREE.MTLLoader(manager)
    .setPath('models/mountain/')
    .load('mountain.mtl', function (materials) {

      materials.preload();

      new THREE.OBJLoader(manager)
        .setMaterials(materials)
        .setPath('models/mountain/')
        .load('mountain.obj', function (object) {


          scene.add(object);
          console.log("foo")
          object.scale.set(0.2, 0.2, 0.2)

          console.log(object)

          for (let i in object.children) {
            let child = object.children[i]
            if (child.material) {
              child.material.shininess = 2.5
            }
          }

        }, onProgress, onError);

    });

  new THREE.MTLLoader(manager)
    .setPath('models/wolf/')
    .load('PUSHILIN_wolf.mtl', function (materials) {

      materials.preload();

      new THREE.OBJLoader(manager)
        .setMaterials(materials)
        .setPath('models/wolf/')
        .load('PUSHILIN_wolf.obj', function (object) {


          scene.add(object);
          console.log("foo")
          object.scale.set(30, 30, 30)
          object.position.set(10, 35, 30);

          console.log(object)

          for (let i in object.children) {
            let child = object.children[i]
            if (child.material) {
              child.material.shininess = 1
            }
          }

        }, onProgress, onError);

    });

  renderer.setClearColor(0xeeeeee, 1);

  renderer.render(scene, camera);


  animate();
  // 毎フレーム時に実行されるイベント
  function animate() {
    //箱を回転させる
    //ここの数値を変えると回転速度が変わる
    box.position.x += 1;
    box.rotation.y += 0.006;
    // sphere.scale.x += 0.001;
    controls.update();


    renderer.render(scene, camera); // レンダリング
    requestAnimationFrame(animate);
  }

  setTimeout(function () {
    console.log(scene.children)
  }, 1000)



  // 初期化のために実行
  onResize();
  // リサイズイベント発生時に実行
  window.addEventListener('resize', onResize);
  function onResize() {
    // サイズを取得
    const width = window.innerWidth;
    const height = window.innerHeight;
    // レンダラーのサイズを調整する
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    // カメラのアスペクト比を正す
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  // テクスチャ読み込み
  var texEqu = new THREE.TextureLoader().load("images/sky.jpg");
  texEqu.anisotropy = renderer.getMaxAnisotropy();
  // texEqu.mapping = THREE.EquirectangularReflectionMapping;
  texEqu.mapping = THREE.UVMapping;

  // 背景用ジオメトリ生成
  var d = 6000;
  var geo = new THREE.SphereGeometry(d, 32, 32);
  geo.scale(-1, 1, 1); // コレを指定しないと背景が左右反転してしまう
  var mat = new THREE.MeshBasicMaterial({
    map: texEqu,
    fog: false,
  });
  bgMesh = new THREE.Mesh(geo, mat);
  scene.add(bgMesh);

}
