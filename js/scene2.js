
function init2() {

  //canvasに描画する要素の大きさ

  // 移動距離算出 即時関数
  let move = (function () {

    const SPEED = 60.0;

    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let prevTime = performance.now();

    // キーダウンイベント設定
    document.addEventListener('keydown', function (e) {
      switch (e.keyCode) {
        case 87: // w
          moveForward = true;
          break;
        case 65: // a
          moveLeft = true;
          break;
        case 83: // s
          moveBackward = true;
          break;
        case 68: // d
          moveRight = true;
          break;
      }
    }, false);

    // キーアップイベント設定
    document.addEventListener('keyup', function (e) {
      switch (e.keyCode) {
        case 87: // w
          moveForward = false;
          break;
        case 65: // a
          moveLeft = false;
          break;
        case 83: // s
          moveBackward = false;
          break;
        case 68: // d
          moveRight = false;
          break;
      }
    }, false);

    return {
      getVelocity() {
        let time = performance.now();
        let delta = (time - prevTime) / 1000;
        let directionX = Number(moveLeft) - Number(moveRight);
        let directionZ = Number(moveForward) - Number(moveBackward);
        let velocity = new THREE.Vector3();
        velocity.x -= directionX * SPEED * delta;
        velocity.z -= directionZ * SPEED * delta;
        prevTime = time;
        return velocity;
      }
    }

  })();


  // cannon.jsでワールド作成
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);                   // 重力を設定
  world.broadphase = new CANNON.NaiveBroadphase();  // ぶつかっている可能性のあるオブジェクト同士を見つける
  world.solver.iterations = 8;                      // 反復計算回数
  world.solver.tolerance = 0.1;                     // 許容値

  // cannon.jsでワールド作成

  // cannon.jsで箱作成
  const boxMass = 1;                                                 // 箱の質量
  const boxShape = new CANNON.Box(new CANNON.Vec3(10, 10, 10));         // 箱の形状
  const phyBox = new CANNON.Body({ mass: boxMass, shape: boxShape });  // 箱作成
  phyBox.position.set(-200, 200, -200);                                     // 箱の位置
  phyBox.angularVelocity.set(0.3, 0.3, 0.3);                         // 角速度
  phyBox.angularDamping = 0.3;                                       // 減衰率
  world.addBody(phyBox);                                             // ワールドに箱追加

  document.onkeydown = (e) => {
    var vector;
    if (e.keyCode == 37) {
      vector = new THREE.Vector3(-50, 0, 0);
    } else if (e.keyCode == 38) {
      vector = new THREE.Vector3(0, 0, -50);
    } else if (e.keyCode == 39) {
      vector = new THREE.Vector3(50, 0, 0);
    } else if (e.keyCode == 40) {
      vector = new THREE.Vector3(0, 0, 50);
    }

    vector.applyQuaternion(camera.quaternion);
    phyBox.velocity.x = vector.x
    phyBox.velocity.y = vector.y
    phyBox.velocity.z = vector.z
  }
  document.onkeyup = (e) => {
    phyBox.velocity.x = 0
  }

  window.addEventListener('load', init);
  //この下にコードを記述していきます。

  // レンダラーを作成
  var renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#myCanvas')
  });
  renderer.setPixelRatio(window.devicePixelRatio);

  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  // シーンを作成
  var scene = new THREE.Scene();
  // カメラを作成
  var camera = new THREE.PerspectiveCamera(80, width / height, 1, 10000);
  camera.position.set(50, 50, +1000);

  var ambientLight = new THREE.AmbientLight(0xeeeeee, 0.9);
  scene.add(ambientLight)

  var directionalLight = new THREE.DirectionalLight(0xeeeeee, 0.5);
  scene.add(directionalLight);

  // var controls = new THREE.OrbitControls(camera, renderer.domElement);
  var controls = new THREE.PointerLockControls(camera);
  controls.getObject().position.y = 10
  // canvasクリックでポインタロック
  scene.add(controls.getObject());
  document.getElementById('myCanvas').addEventListener('click', function () {
    controls.lock();
  });

  // 箱を作成
  var geometry = new THREE.BoxGeometry(400, 400, 400);
  var sphere = new THREE.SphereGeometry(200, 30, 30);
  const material2 = new THREE.MeshBasicMaterial({
    color: '#A2D7DD',
    side: THREE.BackSide,
  });
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

          for (let i in object.children) {
            let child = object.children[i]
            let bufferGeometry = child.geometry

            let geometry = new THREE.Geometry().fromBufferGeometry(bufferGeometry);

            let oldVertices = geometry.vertices
            let newVertices = []
            for (let i in oldVertices) {
              let oldVertex = oldVertices[i]
              newVertices.push(oldVertex.x)
              newVertices.push(oldVertex.y)
              newVertices.push(oldVertex.z)
            }

            let oldIndices = geometry.faces
            let newIndices = []
            for (let i in oldIndices) {
              let oldIndex = oldIndices[i]
              newIndices.push(oldIndex.a)
              newIndices.push(oldIndex.b)
              newIndices.push(oldIndex.c)
            }
            // ↑↑↑3Dobjecからhttps://schteppe.github.io/cannon.js/docs/classes/Trimesh.htmlのExampleみたいに値を取り出してる↑↑↑
            var trimeshShape = new CANNON.Trimesh(newVertices, newIndices);
            var ground = new CANNON.Body({ mass: 0, shape: trimeshShape });
            // console.log(child)
            world.add(ground);

          }

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

  var shape = new CANNON.Plane();

  var mass = 0;
  var phyPlane = new CANNON.Body({ mass, shape });
  phyPlane.position.set(0, 50, 0)
  phyPlane.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);   //X軸に９０度回転
  world.add(phyPlane);
  console.log(phyPlane)
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

  var fogDepth = 3000;
  var fogTimeCount = 0;

  animate();//名前なんでもいい

  // 毎フレーム時に実行されるイベント
  function animate() {
    fogTimeCount += 1;
    if (fogTimeCount > 300 && fogDepth > 50) {
      fogDepth -= 5
    }
    scene.fog = new THREE.Fog(0xffffff, 50, fogDepth);


    // phyBox.velocity.x = 30
    // phyBox.velocity.y = 0
    // phyBox.velocity.z = 0

    let v = move.getVelocity();
    controls.getObject().translateX(v.x)
    controls.getObject().translateZ(v.z)

    //箱を回転させる
    //ここの数値を変えると回転速度が変わる
    box.position.x += 1;
    box.rotation.y += 0.006;
    // sphere.scale.x += 0.001;

    requestAnimationFrame(animate);　//さっきつけた名前をマイフレーム呼び出す

    // ワールドの時間を進める
    world.step(1 / 30);
    // cannon.jsからthree.jsにオブジェクトの位置をコピー
    camera.position.copy(phyBox.position);

    renderer.render(scene, camera); // レンダリング
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
  var texEqu = new THREE.TextureLoader().load("images/sky2.png");
  texEqu.anisotropy = renderer.getMaxAnisotropy();
  // texEqu.mapping = THREE.EquirectangularReflectionMapping;
  texEqu.mapping = THREE.UVMapping;

  // 背景用ジオメトリ生成
  var d = 6000;
  var geo = new THREE.SphereGeometry(d, 32, 32);
  geo.scale(-1, 1, 1); // コレを指定しないと背景が左右反転してしまう
  var mat = new THREE.MeshBasicMaterial({
    map: texEqu,
    // fog: false,
  });
  bgMesh = new THREE.Mesh(geo, mat);
  scene.add(bgMesh);

}

// console.log(#####)←ログ出し方
