'use strict'

window.addEventListener('DOMContentLoaded', _ => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x444444)
  scene.fog = new THREE.Fog(scene.background)

  const canvas = document.querySelector('canvas')
  const canvasContainer = document.querySelector('#game-container')

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: 1, gammaOutput: 1, gammaFactor: 2,
  })

  const camera = new THREE.PerspectiveCamera(
    75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
  camera.position.z = 5
  camera.lookAt(0, 0, 0)

  window.addEventListener('resize', (_ => {
    let w = canvasContainer.offsetWidth, h = canvasContainer.offsetHeight

    if (w < h) [w, h] = [h, w]

    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(w, h)
  })())

  const geo = new THREE.BoxGeometry(0.25, 0.25, 0.25)
  const mat = new THREE.MeshBasicMaterial({color: 0xaaf0ff})
  const player = new THREE.Mesh(geo, mat)
  const playerGroup = new THREE.Group()

  playerGroup.add(player)
  playerGroup.add(camera)
  scene.add(playerGroup)

  const pointGeo = new THREE.SphereGeometry(0.25, 0.25, 0.25)
  const pointMat = new THREE.MeshBasicMaterial({color: 0xffffff})
  const points = new THREE.Group()

  let i = 25
  while(i--) {
    let point = new THREE.Mesh(pointGeo, pointMat)
    point.position.set(-2000, 0)

    points.add(point)
  }

  scene.add(points)

  const enemyMat = new THREE.MeshBasicMaterial({color: 0xff0000})
  const enemies = new THREE.Group()

  i = 5
  while(i--) {
    let enemy = new THREE.Mesh(geo, enemyMat)
    enemy.position.set(0, 0, 0)

    enemies.add(enemy)
  }
  scene.add(enemies)

  const pointDisplay = document.querySelector('#point-display')

  window.addEventListener('contextmenu', e => {
    e.preventDefault()
  })
  window.addEventListener('mousedown', e => {
    fakeSocket.emit([0, e.button, 1])
  })
  window.addEventListener('mouseup', e => {
    fakeSocket.emit([0, e.button, 0])
  })
  window.addEventListener('mousemove', e => {
    fakeSocket.emit([1, e.clientX - document.body.clientWidth * 0.5, document.body.clientHeight * 0.5 - e.clientY])
  })

  fakeSocket.onResp(e => {
    if (e[0] === 0)
      playerGroup.position.set(e[1], e[2], e[3])
    else if(e[0] === 1)
      player.quaternion.set(e[1], e[2], e[3], e[4])
    else if (e[0] === 2) {
      if (!points.children[e[4]]) return
      points.children[e[4]].position.set(e[1], e[2], e[3])
    } else if(e[0] === 3) {
      if (!enemies.children[e[4]]) return
      enemies.children[e[4]].position.set(e[1], e[2], e[3])
    } else if (e[0] === 4)
      pointDisplay.innerText = `You: ${e[1] || 0}`
  })
  
  function animate(timeElapsed) {
    requestAnimationFrame(animate)

    fakeSocket.serverUpdate()
    renderer.render(scene, camera)
  }

  animate(0)
})

const fakeSocket = {
  player: new THREE.Object3D(),
  callbacks: [],
  pointDrops: [],
  enemies: [],
  emit(event) {
    this.serverOn(event)
  },
  serverOn(e) {
    if (e[0]) {
      this.player.lookAt(this.player.position.clone().add(new THREE.Vector3(e[1], e[2], 0)))
    } else {
      this.player.moving = (e[1] === 0 || e[1] === 2) && e[2]
      this.callbacks.forEach(cb => cb([0, this.player.quaternion.x, this.player.quaternion.y, this.player.quaternion.z]))
    }
  },
  onResp(cb) {
    this.callbacks.push(cb)
  },
  serverUpdate() {
    console.log(this.player.position.distanceToSquared(new THREE.Vector3(0, 0, 0)))
    this.callbacks.forEach(cb => {
      this.player.moving && this.player.translateZ(0.1)

      if (this.pointDrops.length < 100) this.pointDrops.push([Math.random() * 20 - 10, Math.random() * 20 - 10, 0, this.pointDrops.length])
      if (this.enemies.length < 7) this.enemies.push([(Math.random() * 8 + 2) * (Math.random() > 0.5 ? 1 : -1), (Math.random() * 8 + 2) * (Math.random() > 0.5 ? 1 : -1), 0, this.enemies.length])
      
      this.pointDrops.forEach(pD => {
        if (this.player.position.distanceToSquared(new THREE.Vector3().fromArray(pD)) < 0.2) {
          this.player.points = (this.player.points || 0) + 1
          pD[0] = -2000
        }
        
        if (pD[0] < -1000) {
          pD[0] = Math.random() * 20 - 10
          pD[1] = Math.random() * 20 - 10
        }

        cb([2, pD[0], pD[1], pD[2], pD[3]])
      })

      this.enemies.forEach(enemy => {
        enemy[0] += (Math.random() - 0.5 + (enemy[3]%2 ? 0.1 : -0.01)) * 0.1
        enemy[1] += (Math.random() - 0.5 + (enemy[3]%2 ? 0.1 : -0.01)) * 0.1

        if (this.player.position.distanceToSquared(new THREE.Vector3().fromArray(enemy)) < 0.1) {
          this.player.position.set(0, 0, 0)
          this.player.points = 0

          enemy[0] = (Math.random() * 10 + 2) * (Math.random() > 0.5 ? 1 : -1)
          enemy[1] = (Math.random() * 10 + 2) * (Math.random() > 0.5 ? 1 : -1)
        }
        
        cb([3, enemy[0], enemy[1], enemy[2], enemy[3]])
      })

      cb([0, this.player.position.x, this.player.position.y, this.player.position.z])
      cb([1, this.player.quaternion.x, this.player.quaternion.y, this.player.quaternion.z, this.player.quaternion.w])
      cb([4, this.player.points])
    })

  }
}