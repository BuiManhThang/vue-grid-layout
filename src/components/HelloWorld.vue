<template>
  <div class="test">
    <div>
      <div class="layoutJSON">
        Displayed as <code>[x, y, w, h]</code>:
        <div class="columns">
          <div class="layoutItem" v-for="(item, idx) in layout" :key="idx">
            <b>{{ item.i }}</b
            >: [{{ item.x }}, {{ item.y }}, {{ item.w }}, {{ item.h }}]
          </div>
        </div>
      </div>
    </div>
    <br />
    <div id="content">
      <grid-layout
        ref="gridlayout"
        v-model:layout="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :use-css-transforms="true"
      >
        <grid-item
          :key="item.i"
          v-for="item in layout"
          ref="itemRefs"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
        >
          <span class="text">{{ item.i }}</span>
        </grid-item>
      </grid-layout>
    </div>
    <br />
    <div
      @drag="drag"
      @dragend="dragend"
      class="droppable-element"
      draggable="true"
      unselectable="on"
    >
      Droppable Element (Drag me!)
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, onUnmounted } from 'vue'

// import {GridLayout, GridItem} from "vue-grid-layout"
let mouseXY = { x: null, y: null }
let DragPos = { x: null, y: null, w: 6, h: 7, i: null }

const itemRefs = ref([])
const gridlayout = ref(null)

const colNum = ref(12)

const layout = ref([
  { x: 0, y: 0, w: 12, h: 7, i: '0' },
  { x: 0, y: 7, w: 12, h: 7, i: '1' },
  { x: 0, y: 7, w: 12, h: 7, i: '9' },
  { x: 0, y: 7, w: 12, h: 7, i: '3' },
  { x: 0, y: 7, w: 12, h: 7, i: '10' },
  //   { x: 4, y: 0, w: 2, h: 5, i: '2' },
  //   { x: 6, y: 0, w: 2, h: 3, i: '3' },
  //   { x: 8, y: 0, w: 2, h: 3, i: '4' },
  //   { x: 10, y: 0, w: 2, h: 3, i: '5' },
  //   { x: 0, y: 5, w: 2, h: 5, i: '6' },
  //   { x: 2, y: 5, w: 2, h: 5, i: '7' },
  //   { x: 4, y: 5, w: 2, h: 5, i: '8' },
  //   { x: 5, y: 10, w: 4, h: 3, i: '9' },
])

const delay = ref(0)

const opacityItem = (e) => {
  e.target.style.opacity = '0.5'
  e.target.style.border = '1px dashed red'
}

const removeOpacityItem = (e) => {
  e.target.style.opacity = null
  e.target.style.border = null
}

const drag = (e) => {
  if (delay.value < 10) {
    delay.value += 1
    return
  }
  delay.value = 0
  opacityItem(e)
  let parentRect = document.getElementById('content').getBoundingClientRect()
  let mouseInGrid = false
  if (
    mouseXY.x > parentRect.left &&
    mouseXY.x < parentRect.right &&
    mouseXY.y > parentRect.top &&
    mouseXY.y < parentRect.bottom
  ) {
    mouseInGrid = true
  }
  if (mouseInGrid === true && layout.value.findIndex((item) => item.i === 'drop') === -1) {
    layout.value.push({
      x: (layout.value.length * 2) % (colNum.value || 12),
      y: layout.value.length + (colNum.value || 12), // puts it at the bottom
      w: 6,
      h: 7,
      i: 'drop',
    })
  }
  let index = layout.value.findIndex((item) => item.i === 'drop')
  if (index !== -1) {
    if (itemRefs.value.length > index) {
      itemRefs.value[index].$refs.item.style.display = 'none'
      let el = itemRefs.value[index]
      el.dragging = { top: mouseXY.y - parentRect.top, left: mouseXY.x - parentRect.left }
      let new_pos = el.calcXY(mouseXY.y - parentRect.top, mouseXY.x - parentRect.left)

      if (mouseInGrid === true) {
        gridlayout.value.dragEvent(
          'dragstart',
          'drop',
          new_pos.x,
          new_pos.y,
          layout.value[index].h,
          layout.value[index].w
        )
        // DragPos.i = String(index)
        DragPos.x = layout.value[index].x
        DragPos.y = layout.value[index].y
        DragPos.w = layout.value[index].w
        DragPos.h = layout.value[index].h
      }
      if (mouseInGrid === false) {
        gridlayout.value.dragEvent('dragend', 'drop', new_pos.x, new_pos.y, DragPos.h, DragPos.w)
        layout.value = layout.value.filter((obj) => obj.i !== 'drop')
      }
    }
  }
}

const genereateNewId = () => {
  const ids = layout.value.map((item) => parseInt(item.i))
  const maxId = Math.max(...ids)
  return `${maxId + 1}`
}

const dragend = (e) => {
  removeOpacityItem(e)
  let parentRect = document.getElementById('content').getBoundingClientRect()
  let mouseInGrid = false
  if (
    mouseXY.x > parentRect.left &&
    mouseXY.x < parentRect.right &&
    mouseXY.y > parentRect.top &&
    mouseXY.y < parentRect.bottom
  ) {
    mouseInGrid = true
  }
  if (mouseInGrid === true) {
    gridlayout.value.dragEvent('dragend', 'drop', DragPos.x, DragPos.y, DragPos.h, DragPos.w)
    layout.value = layout.value.filter((obj) => obj.i !== 'drop')

    // UNCOMMENT below if you want to add a grid-item
    nextTick(() => {
      DragPos.i = genereateNewId()
      layout.value.push({
        x: DragPos.x,
        y: DragPos.y,
        w: DragPos.w,
        h: DragPos.h,
        i: DragPos.i,
      })

      gridlayout.value.dragEvent('dragend', DragPos.i, DragPos.x, DragPos.y, DragPos.h, DragPos.w)
      // if (itemRefs.value.length > 0) {
      //   const lastItem = itemRefs.value[layout.value.length - 1]
      //   if (lastItem) {
      //     console.log('last item')
      //     itemRefs.value[layout.value.length - 1].$refs.item.style.display = 'block'
      //   }
      // }
    })
  }
}

const dranggOverEvent = (e) => {
  mouseXY.x = e.clientX
  mouseXY.y = e.clientY
}

onMounted(() => {
  document.addEventListener('dragover', dranggOverEvent, false)
})

onUnmounted(() => {
  document.removeEventListener('dragover', dranggOverEvent, false)
})
</script>

<style scoped>
/* .vue-grid-item.cssTransforms {
  transition-property: inherit !important;
}
.vue-resizable.resizing {
  pointer-events: none;
}
.vue-draggable-dragging {
  pointer-events: none;
} */

.droppable-element {
  width: 150px;
  text-align: center;
  background: #fdd;
  border: 1px solid black;
  margin: 10px 0;
  padding: 10px;
}

.vue-grid-layout {
  background: #eee;
}

.vue-grid-item:not(.vue-grid-placeholder) {
  background: #ccc;
  border: 1px solid black;
}

.vue-grid-item .resizing {
  opacity: 0.9;
}

.vue-grid-item .static {
  background: #cce;
}

.vue-grid-item .text {
  font-size: 24px;
  text-align: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  height: 100%;
  width: 100%;
}

.vue-grid-item .no-drag {
  height: 100%;
  width: 100%;
}

.vue-grid-item .minMax {
  font-size: 12px;
}

.vue-grid-item .add {
  cursor: pointer;
}

.vue-draggable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  top: 0;
  left: 0;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='5' cy='5' r='5' fill='#999999'/></svg>")
    no-repeat;
  background-position: bottom right;
  padding: 0 8px 8px 0;
  background-repeat: no-repeat;
  background-origin: content-box;
  box-sizing: border-box;
  cursor: pointer;
}

.layoutJSON {
  background: #ddd;
  border: 1px solid black;
  margin-top: 10px;
  padding: 10px;
}

.layoutJSON {
  background: #ddd;
  border: 1px solid black;
  margin-top: 10px;
  padding: 10px;
}

.columns {
  -moz-columns: 120px;
  -webkit-columns: 120px;
  columns: 120px;
}

.test {
  display: flex;
}
#content {
  width: calc(100vw - 500px);
}
.droppable-element {
  margin-top: 500px;
  width: 200px;
  height: 100px;
}
</style>
