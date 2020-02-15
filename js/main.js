window.addEventListener('load', init);

function init() {

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
  world.gravity.set(0, -9.8, 0);                   // 重力を設定
  world.broadphase = new CANNON.NaiveBroadphase();  // ぶつかっている可能性のあるオブジェクト同士を見つける
  world.solver.iterations = 8;                      // 反復計算回数
  world.solver.tolerance = 0.1;                     // 許容値

  document.onkeydown = (e) => {
    var vector;
    if (e.keyCode == 37) {
      vector = new THREE.Vector3(-5, 0, 0);
    } else if (e.keyCode == 38) {
      vector = new THREE.Vector3(0, 0, -5);
    } else if (e.keyCode == 39) {
      vector = new THREE.Vector3(5, 0, 0);
    } else if (e.keyCode == 40) {
      vector = new THREE.Vector3(0, 0, 5);
    }
    if (vector) {
      vector.applyQuaternion(camera.quaternion);
    }
    phyBox.velocity.x = vector.x
    phyBox.velocity.y = vector.y
    phyBox.velocity.z = vector.z
  }
  document.onkeyup = (e) => {
    phyBox.velocity.x = 0
  }


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

  var ambientLight = new THREE.AmbientLight(0xeeeeee, 0.9);
  scene.add(ambientLight)

  var spotLight = new THREE.SpotLight(0xeeeeee, 0.5, 0, Math.PI / 3);
  spotLight.position.set(0, 8, 0)
  spotLight.castShadow = true;

  spotLight.shadowMapWidth = 1024; // これ! 影の解像度
  spotLight.shadowMapHeight = 1024; // これ!

  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.shadowCameraFar = 150;

  scene.add(spotLight);

  var helper = new THREE.SpotLightHelper(spotLight, 20, 0xff0000)
  scene.add(helper)


  function generatePlane(x, y, z, width, height, axis, angle) {//数値だけ入れて複製できるようにgeneratePlaneっていう関数作る
    const planeMass = 0;                                                 // planeの質量
    const planeShape = new CANNON.Plane(new CANNON.Vec3(width, height));         // planeの形状
    const phyPlane = new CANNON.Body({ mass: planeMass, shape: planeShape });  // plane作成
    phyPlane.position.set(x, y, z);                                     // planeの位置

    if (!angle) {//angleに何も入ってなかったら90度回転追加。壁を180度回転させたかったから。
      angle = Math.PI / 2;
    }

    phyPlane.quaternion.setFromAxisAngle(axis, angle);
    world.addBody(phyPlane);                                             // ワールドにplane追加


    const planeGeometry = new THREE.PlaneGeometry(width, height);

    const planeMaterial = new THREE.MeshPhongMaterial({
      color: 0xfffffff, side: THREE.DoubleSide,
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(x, y, z);
    plane.quaternion.setFromAxisAngle(axis, angle);
    scene.add(plane);
  }

  generatePlane(0, 0, 0, 24, 24, new CANNON.Vec3(-1, 0, 0))
  generatePlane(12, 5, 0, 24, 10, new CANNON.Vec3(0, -1, 0))
  generatePlane(0, 5, 12, 24, 10, new CANNON.Vec3(-1, 0, 0), Math.PI)
  generatePlane(-12, 5, 0, 24, 10, new CANNON.Vec3(0, 1, 0))
  generatePlane(0, 12, -12, 24, 24, new CANNON.Vec3(0, 0, 0))
  generatePlane(0, 10, 3, 24, 18, new CANNON.Vec3(1, 0, 0))
  generatePlane(0, 15, -8, 24, 10, new CANNON.Vec3(0, 0, 0))
  generatePlane(12, 17, -9, 6, 14, new CANNON.Vec3(0, -1, 0))
  generatePlane(-12, 17, -9, 6, 14, new CANNON.Vec3(0, 1, 0))

  generatePlane(0, 24, -9, 24, 6, new CANNON.Vec3(1, 0, 0)) //これがでない


  // cannon.jsで人作成
  const boxMass = 1;                                                 // 箱の質量
  const boxShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));         // 箱の形状
  var boxMat = new CANNON.Material({ restitution: 0, friction: 0 });

  const phyBox = new CANNON.Body({ mass: boxMass, shape: boxShape, material: boxMat });  // 箱作成
  phyBox.position.set(5, 4, 5);                                     // 箱の位置
  world.addBody(phyBox);                                             // ワールドに箱追加
  // カメラを作成
  var camera = new THREE.PerspectiveCamera(35, width / height, 1, 10000);
  camera.position.set(5, 4, 5);

  // var controls = new THREE.OrbitControls(camera, renderer.domElement);
  var controls = new THREE.PointerLockControls(camera);
  // controls.getObject().position.y = 100
  // canvasクリックでポインタロック
  scene.add(controls.getObject());
  document.getElementById('myCanvas').addEventListener('click', function () {
    controls.lock();
  });


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
    .setPath('models/step/')
    .load('step.mtl', function (materials) {

      materials.preload();

      new THREE.OBJLoader(manager)
        .setMaterials(materials)
        .setPath('models/step/')
        .load('step.obj', function (object) {

          object.scale.set(0.01, 0.01, 0.01)

          var material = new THREE.MeshPhongMaterial({
            color: 0x00FF7F,
            ambient: 0x990000,
            specular: 0xffff00,
            shininess: 30,
            metal: true,
          });

          for (let i in object.children) {
            let child = object.children[i]
            if (child.name.includes("立方体")) {
              child.material = material
            }
          }

          scene.add(object);

        }, onProgress, onError);

    });


  renderer.setClearColor(0x000000, 1); //影
  renderer.shadowMap.enabled = true;
  renderer.shadowMapType = THREE.PCFSoftShadowMap;
  renderer.render(scene, camera);

  console.log(phyBox.velocity, phyBox.position)

  let j = 0;
  // var fogDepth = 3000;
  // var fogTimeCount = 0;
  animate()
  // 毎フレーム時に実行されるイベント
  function animate() {
    // fogTimeCount += 1;
    // if (fogTimeCount > 300 && fogDepth > 50) {
    //   fogDepth -= 5
    // }
    // scene.fog = new THREE.Fog(0xffffff, 50, fogDepth);

    scene.traverse(function (node) {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;   // 影をつけるオブジェクト　毎秒呼び出してオブジェクトの読み込みが遅かった場合にも対応
        node.receiveShadow = true;
      }
    });

    // let v = move.getVelocity();
    // controls.getObject().translateX(v.x)
    // controls.getObject().translateZ(v.z)

    // ワールドの時間を進める
    // cannon.jsからthree.jsにオブジェクトの位置をコピー
    camera.position.copy(phyBox.position);

    console.log(phyBox.velocity)

    world.step(1 / 60);//60FPS
    requestAnimationFrame(animate);　//さっきつけた名前をマイフレーム呼び出す
    renderer.render(scene, camera); // レンダリング

  }



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

}

// console.log(#####)←ログ出し方
// php -S localhost:8000 ←簡易で動かす
