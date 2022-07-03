const vueRtTemplate = require('./templates/vue_rt.template')
const vueTemplate = require('./templates/vue.template')

const input: HTMLTextAreaElement = document.querySelector('#input')
const output: HTMLTextAreaElement = document.querySelector('#output')
const svgWrapper: HTMLElement = document.querySelector('#svg-wrapper')
const outputSvgWrapper: HTMLElement = document.querySelector('#output-svg-wrapper')
const verticalSelector: HTMLElement = document.querySelector('#vertical-selector')
const horizontalSelector: HTMLElement = document.querySelector('#horizontal-selector')
const main: HTMLElement = document.querySelector('#main')
const imagesWrapper: HTMLElement = document.querySelector('#images-wrapper')
const dropContainer: HTMLElement = document.querySelector('#drop-container')
const transformsMessage: HTMLElement = document.querySelector('#transform-message')

const targetWidthInput: HTMLInputElement = document.querySelector('#target-width')
const targetHeightInput: HTMLInputElement = document.querySelector('#target-height')
const resetButton: HTMLElement = document.querySelector('#reset-button')
const processButton: HTMLElement = document.querySelector('#process-button')
const themeButton: HTMLElement = document.querySelector('#theme-button')
const zoomInButton: HTMLElement = document.querySelector('#zoom-in-button')
const zoomOutButton: HTMLElement = document.querySelector('#zoom-out-button')
const xCheckbox: HTMLInputElement = document.querySelector('#x-checkbox')
const yCheckbox: HTMLInputElement = document.querySelector('#y-checkbox')
const tabs: NodeListOf<HTMLElement> = document.querySelectorAll('.output-type-tab')

let svg: SVGElement = null
let svgWidth: number = null
let svgHeight: number = null
let svgSizeUnits: string = null
let sliceX: number = null
let sliceY: number = null
let targetWidth: string = null
let targetHeight: string = null
let numberTargetWidth: number = null
let numberTargetHeight: number = null
let theme = '#060606'
let zoom = 1
let outputInterval: number = null
let isX = true
let isY = true
let outputType: OutputType = 'template'
const outputs: { [key in OutputType]: string } = {
  template: '',
  vue: '',
  vue_rt: ''
}

const statsWidth: HTMLElement = document.querySelector('#stats-width')
const statsHeight: HTMLElement = document.querySelector('#stats-height')
const statsSlice: HTMLElement = document.querySelector('#stats-slice')
const statsZoom: HTMLElement = document.querySelector('#stats-zoom')

input.addEventListener('input', inputHandler)
svgWrapper.addEventListener('mousemove', mouseMoveHandler)
svgWrapper.addEventListener('mouseleave', svgLeaveHandler)
svgWrapper.addEventListener('click', svgClickHandler)
processButton.addEventListener('click', processClickHandler)
resetButton.addEventListener('click', resetSlice)
themeButton.addEventListener('click', changeTheme)
zoomInButton.addEventListener('click', zoomIn)
zoomOutButton.addEventListener('click', zoomOut)
xCheckbox.addEventListener('change', toggleX)
yCheckbox.addEventListener('change', toggleY)
tabs.forEach(tab => tab.addEventListener('click', tabClickHandler))

const READY_INSTRUCTION = 'specify width (number or variable name), set slice point and click process'

function getSvgCommandLength(cmd: string) {
  const SVG_COMMAND_LENGTHS: { [key: string]: number} = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7 }
  return SVG_COMMAND_LENGTHS[cmd.toLowerCase()]
}

function inputHandler() {
  resetSlice()
  setOutput()
  setZoom(1)
  handleTransformMessage()
  svgWrapper.innerHTML = input.value
  svg = svgWrapper.querySelector('svg')
  if (svg) {
    svgWidth = parseFloat(svgWrapper.innerHTML.match(/(<svg[^>]+width=")([\d.]+)/)?.[2]) || parseFloat(svgWrapper.innerHTML.match(/(<svg[^>]+viewBox="[\d.]+\s[\d.]+\s)([\d.]+)/)?.[2])
    svgHeight = parseFloat(svgWrapper.innerHTML.match(/(<svg[^>]+height=")([\d.]+)/)?.[2]) || parseFloat(svgWrapper.innerHTML.match(/(<svg[^>]+viewBox="[\d.]+\s[\d.]+\s[\d.]+\s)([\d.]+)/)?.[2])
    svgSizeUnits = svgWrapper.innerHTML.match(/(<svg[^>]+width=")[\d.]+(\w+)/)?.[2] || 'px'
    setDimensions(svgWidth, svgHeight, svgSizeUnits)
    if (!svgWidth || !svgHeight) {
      svgWrapper.innerHTML = ''
      setOutput('invalid svg')
      return
    }
    // rewrite svg ids
    let regex = /\sid="([^"]+)"/g
    let output = input.value
    const allIds = output.match(regex)
    allIds?.forEach(id => {
      const randomStr = (Math.random() + 1).toString(36).substring(7)
      regex = new RegExp(regex, '')
      const idValue = id.match(regex)[1]
      output = output.replace(id, ` id="${randomStr}"`)
      output = output.replace(new RegExp(`#${idValue}`, 'g'), `#${randomStr}`)
    })
    svgWrapper.innerHTML = output
    setOutput(READY_INSTRUCTION)
  } else {
    svgWrapper.innerHTML = ''
    setDimensions()
    setOutput('invalid svg')
  }
}

function setDimensions(w: string | number = '', h: string | number = '', unit = 'px') {
  svgWrapper.style.width = w ? w + unit : ''
  svgWrapper.style.height = h ? h + unit : ''
  statsWidth.innerHTML = w ? w + '' : 'null'
  statsHeight.innerHTML = h ? h + '' : 'null'
}

function mouseMoveHandler(e: MouseEvent) {
  if (!svg || isX && sliceX || isY && sliceY) return
  if (isX) setVerticalSelectorPos(true, e)
  if (isY) setHorizontalSelectorPos(true, e)
}

function setVerticalSelectorPos(show: boolean, e?: MouseEvent) {
  const offsetX = e?.offsetX ?? sliceX
  horizontalSelector.style.opacity = show ? '1' : '0'
  horizontalSelector.style.height = svgWrapper.clientHeight + 'px'
  horizontalSelector.style.top = svgWrapper.offsetTop + 'px'
  horizontalSelector.style.left = svgWrapper.offsetLeft + offsetX + 'px'
  horizontalSelector.style.width = 1 / zoom + 'px'
}

function setHorizontalSelectorPos(show: boolean, e?: MouseEvent) {
  const offsetY = e?.offsetY ?? sliceY
  verticalSelector.style.opacity = show ? '1' : '0'
  verticalSelector.style.height = 1 / zoom + 'px'
  verticalSelector.style.top = svgWrapper.offsetTop + offsetY + 'px'
  verticalSelector.style.left = svgWrapper.offsetLeft + 'px'
  verticalSelector.style.width = svgWrapper.clientWidth + 'px'
}

function svgLeaveHandler() {
  if (isX && sliceX || isY && sliceY) return
  setVerticalSelectorPos(false)
  setHorizontalSelectorPos(false)
}

function svgClickHandler(e: MouseEvent) {
  if (!svg) return
  if (isX) sliceX = e.offsetX
  if (isY) sliceY = e.offsetY
  setSliceStats()
}

function setSliceStats() {
  const x = sliceX ?? 'null'
  const y = sliceY ?? 'null'
  statsSlice.innerHTML = x + ' ' + y
}

function resetSlice() {
  sliceX = null
  sliceY = null
  setVerticalSelectorPos(false)
  setHorizontalSelectorPos(false)
  setSliceStats()
  setOutput(READY_INSTRUCTION)
}

function changeTheme() {
  theme = theme == '#060606' ? '#fbfbfb' : '#060606'
  main.style.background = theme
}

function p(str: string, condition: boolean) {
  return condition ? str : ''
}

function processSvg(tw: string | number, th: string | number, withOutput = true) {
  targetWidth = (isX ? tw : svgWidth) + ''
  targetHeight = (isY ? th : svgHeight) + ''
  numberTargetWidth = Number(targetWidth)
  numberTargetHeight = Number(targetHeight)

  let output = input.value

  // paths
  let regex = /\sd="[^"]+"/gm
  const allDs = output.match(regex)
  allDs?.forEach(d => {
    const processedD = processPath(d)
    output = output.replace(d, processedD)
  })

  // widths & heights
  const processWidthOrHeight = (widthOrHeight: 'width' | 'height', processMethod: (n: string, offset?: number) => void) => {
    let regex = new RegExp(`(<.+\\s)${widthOrHeight}="[\\d.]+("[^>]+>)`, 'gm')
    const allElementsWithWidthOrHeight = output.match(regex)
    regex = new RegExp(regex, '')
    const numberRegex = new RegExp(`\\s${widthOrHeight}="([\\d.]+)"`, '')
    const offsetAxis = widthOrHeight == 'width' ? 'x' : 'y'
    const offsetRegex = new RegExp(`\\s${offsetAxis}="([\\d.]+)"`)
    allElementsWithWidthOrHeight?.forEach(el => {
      const elBefore = el.match(regex)[1]
      const elAfter = el.match(regex)[2]
      const matchNumber = el.match(numberRegex)[1]
      const matchOffsetNumber = el.match(offsetRegex)?.[1] || 0
      const processedMatchNumber = processMethod(matchNumber, Number(matchOffsetNumber))
      const isDynamic = typeof processedMatchNumber == 'string'
      const processedEl = elBefore + p(':', isDynamic) + widthOrHeight + '="' + processedMatchNumber + elAfter
      output = output.replace(el, processedEl)
    })
  }
  processWidthOrHeight('width', processNumberX)
  processWidthOrHeight('height', processNumberY)

  // x's & y's
  const processXorY = (xOrY: 'x' | 'y', processMethod: (n: string, offset?: number) => void) => {
    let regex = new RegExp(`\\s(c?)${xOrY}(\\d)?="(-?[\\d.]+)"`, 'gm')
    const allMatches = output.match(regex)
    regex = new RegExp(regex, '')
    allMatches?.forEach(m => {
      const match = m.match(regex)
      const mPrefix = match[1] ?? ''
      const mIdx = match[2] ?? ''
      const value = match[3]
      const processedValue = processMethod(value)
      const isDynamic = typeof processedValue == 'string'
      const processedMatch = ` ${p(':', isDynamic)}${mPrefix}${xOrY}${mIdx}="${processedValue}"`
      output = output.replace(m, processedMatch)
    })
  }
  processXorY('x', processNumberX)
  processXorY('y', processNumberY)

  // translations
  regex = /(\w+="[^"]*translate([XY])?\()(-?[\d.]+)((px)?,?\s?)?(-?[\d.]+)?((px)?\))/gm
  const allTranslations = output.match(regex)
  regex = new RegExp(regex, '')
  allTranslations?.forEach(m => {
    const match = m.match(regex)
    const before = match[1]
    const xOrY = match[2] ?? ''
    const firstNumber = match[3]
    const betweenNumbers = match[4] ?? ''
    const secondNumber = match[6]
    const after = match[7] ?? ''
    let processedFirstNumber: string | number = ''
    let processedSecondNumber: string | number = ''
    if (firstNumber) {
      if (xOrY != 'Y') processedFirstNumber = processNumberX(firstNumber)
      else processedFirstNumber = processNumberY(firstNumber)
    }
    if (secondNumber) {
      processedSecondNumber = processNumberY(secondNumber)
    }
    const isDynamic = processedFirstNumber && typeof processedFirstNumber == 'string' || processedSecondNumber && typeof processedSecondNumber == 'string'
    const processedMatch = p(':', isDynamic) + before + xOrY + processedFirstNumber + betweenNumbers + processedSecondNumber + after
    console.log('processing translation', match, '->', processedMatch)
    output = output.replace(m, processedMatch)
  })

  // viewbox
  const outViewboxDimensions =
    p('${', !numberTargetWidth) + targetWidth + p('}', !numberTargetWidth) + ' ' +
    p('${', !numberTargetHeight) + targetHeight + p('}', !numberTargetHeight)
  regex = /(viewBox="[\d.]+\s[\d.]+\s)[\d.]+\s[\d.]+(")/
  const isVbDynamic = outViewboxDimensions.includes('${')
  output = output.replace(regex, `${p(':', isVbDynamic)}$1${outViewboxDimensions}$2`)

  // all processing done, handle output
  if (withOutput) {
    setOutput(output)
  }
  
  return output
}

function processPath(d: string) {
  const inputPath = d.replace(/\sd="([^"]+)"/, '$1')
  let outputPath = ''

  let regex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]+)?/gm
  const allCommands = inputPath.match(regex)
  regex = new RegExp(regex, '')

  let absoluteX = 0
  let absoluteY = 0
  let pathStartX = 0
  let pathStartY = 0
  let wasLastCommandZ = true

  for (let allCommandsIdx = 0; allCommandsIdx < allCommands.length; allCommandsIdx++) {
    const command = allCommands[allCommandsIdx]

    const match = command.match(regex)
    let commandKey = match[1]
    const commandValue = match[2]?.trim()
    const valueSplit = commandValue?.split(/[\s,]|(?<!e)(?=-)/).filter(v => v) || []
    let processedValues = []

    // split long joined commands into single ones
    const singleCommandLength = getSvgCommandLength(commandKey)
    if (valueSplit.length > singleCommandLength) {
      const leftoverValues = valueSplit.splice(singleCommandLength)
      let leftoverKey: string
      if (commandKey == 'm') leftoverKey = 'l'
      else if (commandKey == 'M') leftoverKey = 'L'
      else leftoverKey = commandKey
      const joinedLeftover = leftoverKey + leftoverValues.join(' ')
      allCommands.splice(allCommandsIdx + 1, 0, joinedLeftover)
    }

    console.log('------')
    console.log('command', commandKey, valueSplit.join(' '))

    if (/[mlhvcsqta]/.test(commandKey)) {
      // relative command - replace with absolute
      valueSplit.forEach((val, i) => {
        if (commandKey !== 'v' && i % 2 == 0) {
          // x
          valueSplit[i] = (Number(val) + absoluteX) + ''
        } else {
          // y
          valueSplit[i] = (Number(val) + absoluteY) + ''
        }
        // console.log(val, '->', valueSplit[i])
      })
      commandKey = commandKey.toUpperCase()
      console.log('absolute', commandKey, valueSplit.join(' '), wasLastCommandZ)
    }

    // update absoluteX & absoluteY
    if (commandKey == 'H') {
      absoluteX = Number(valueSplit[0])
    } else if (commandKey == 'V') {
      absoluteY = Number(valueSplit[0])
    } else if (valueSplit.length > 1) {
      absoluteX = Number(valueSplit[valueSplit.length - 2])
      absoluteY = Number(valueSplit[valueSplit.length - 1])
    }

    // if command is z reset absolute positions to path start
    if (/[zZ]/.test(commandKey)) {
      absoluteX = pathStartX
      absoluteY = pathStartY
      wasLastCommandZ = true
      console.log('absolute reset to path start', absoluteX, absoluteY)
    } else if (wasLastCommandZ) {
      // if last command was z, remember this point as pathstart
      wasLastCommandZ = false
      if (commandKey == 'M') {
        pathStartX = absoluteX
        pathStartY = absoluteY
        console.log('path start set', pathStartX, pathStartY)
      }
    }

    // process command values individually
    if (!/[Zz]/.test(commandKey)) {
      let counter = 0
      while (valueSplit.length) {
        let n = valueSplit.shift()
        const setN = (processedN: string | number) => {
          if (typeof processedN == 'string') {
            n = '${' + processedN + '}'
          } else {
            n = processedN + ''
          }
        }
        if (commandKey !== 'V' && counter % 2 == 0) {
          // x
          setN(processNumberX(n))
        } else {
          // y
          setN(processNumberY(n))
        }
        
        processedValues.push(n)
        counter++
      }
    }
    outputPath += commandKey + ' ' + processedValues.join(' ') + ' '
  }

  outputPath = outputPath.trimEnd()
  const isDynamic = outputPath.includes('${')
  outputPath = ` ${p(':', isDynamic)}d="${p('`', isDynamic) + outputPath + p('`', isDynamic)}"`
  return outputPath
}

function processNumberX(n: string, offset = 0) {
  const float = parseFloat(n)
  if (!isX || float + offset < sliceX) return Number(float.toFixed(2))
  const distanceFromRight = svgWidth - float
  const dispanceFromRightFixed = Number(distanceFromRight.toFixed(2))
  if (numberTargetWidth) {
    return Number((numberTargetWidth - dispanceFromRightFixed).toFixed(2))
  } else {
    return targetWidth + (dispanceFromRightFixed ? ' - ' + dispanceFromRightFixed : '')
  }
}

function processNumberY(n: string, offset = 0) {
  const float = parseFloat(n)
  if (!isY || float + offset < sliceY) return Number(float.toFixed(2))
  const distanceFromBottom = svgHeight - float
  const distanceFromBottomFixed = Number(distanceFromBottom.toFixed(2))
  if (numberTargetHeight) {
    return Number((numberTargetHeight - distanceFromBottomFixed).toFixed(2))
  } else {
    return targetHeight + (distanceFromBottomFixed ? ' - ' + distanceFromBottomFixed : '')
  }
}

function setOutput(html = '') {
  Object.keys(outputs).forEach(o => {
    const outputType = o as OutputType
    outputs[outputType] = applyTemplate(html, outputType)
  })
  output.innerHTML = outputs[outputType]
  clearInterval(outputInterval)

  function displayOutputSvg(svg: string, width: number, height: number) {
    outputSvgWrapper.innerHTML = svg
    outputSvgWrapper.style.width = width + svgSizeUnits
    outputSvgWrapper.style.height = height + svgSizeUnits
  }

  if (!html.includes('<svg')) {
    outputSvgWrapper.innerHTML = ''
    outputSvgWrapper.style.width = ''
    outputSvgWrapper.style.height = ''
    return
  }

  if (isX && !numberTargetWidth || isY && !numberTargetHeight) {
    let addStep = 25
    let additionalSize = 0
    const wasNumberTargetWidth = numberTargetWidth
    const wasNumberTargetHeight = numberTargetHeight
    outputInterval = window.setInterval(() => {
      if (addStep > 0 && additionalSize > 199) addStep = -25
      else if (addStep < 0 && additionalSize < 1) addStep = 25
      additionalSize += addStep
      const resultWidth = !wasNumberTargetWidth ? svgWidth + additionalSize : numberTargetWidth
      const resultHeight = !wasNumberTargetHeight ? svgHeight + additionalSize : numberTargetHeight
      const svg = processSvg(resultWidth, resultHeight, false)
      displayOutputSvg(svg, resultWidth, resultHeight)
    }, 500)
  } else {
    displayOutputSvg(html, numberTargetWidth, numberTargetHeight)
  }
}
function applyTemplate(html: string, type: OutputType) {
  if (type == 'template' || !html.includes('<svg')) return html
  let processedTemplate = ''
  if (
    isX && isY && numberTargetWidth && numberTargetHeight ||
    isX && !isY && numberTargetWidth ||
    !isX && isY && numberTargetHeight
  ) {
    setOutputFormat('template')
    return `this output format is not supported for static SVGs
    
to generate a dynamic SVG, try setting target width and/or height to a variable name instead of a number, eg \`width\` and \`height\``
  }
  if (type == 'vue') processedTemplate = vueTemplate
  else if (type == 'vue_rt') processedTemplate = vueRtTemplate
  if (!isX || isX && numberTargetWidth) processedTemplate = processedTemplate.replace(/,?\n.+%width_var%.+/g, '')
  if (!isY || isY && numberTargetHeight) processedTemplate = processedTemplate.replace(/,?\n.+%height_var%.+/g, '')
  processedTemplate = processedTemplate
    .replace(/%template%/g, html.replace(/\n/g, '\n  ') + '')
    .replace(/%width_var%/g, targetWidth)
    .replace(/%height_var%/g, targetHeight)
    .replace(/%initial_width%/g, svgWidth + '')
    .replace(/%initial_height%/g, svgHeight + '')
  return processedTemplate
}
type OutputType = 'vue' | 'vue_rt' | 'template'

// drop files
document.addEventListener('drop', dropHandler)
document.addEventListener('dragenter', dragEnterHandler)
document.addEventListener('dragleave', dragLeaveHandler)
'dragenter dragstart dragend dragleave dragover drag drop'.split(' ').forEach(eventName => {
  document.addEventListener(eventName, (e) => e.preventDefault())
})
function dropHandler(e: DragEvent) {
  // e.preventDefault()
  const file = e.dataTransfer.files[0]
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = () => {
    input.value = reader.result as string
    inputHandler()
  }
  dropContainer.style.display = 'none'
}
function dragEnterHandler(e: DragEvent) {
  dropContainer.style.display = 'flex'
}
function dragLeaveHandler(e: DragEvent) {
  if (e.target !== dropContainer) return
  dropContainer.style.display = 'none'
  // setTimeout(() => dropContainer.style.display = 'none', 0)
}


function zoomIn() {
  setZoom(zoom + 0.1)
}

function zoomOut() {
  if (zoom < 0.2) return
  setZoom(zoom - 0.1)
}

function setZoom(value: number) {
  zoom = value
  imagesWrapper.style.transform = `scale(${zoom})`
  statsZoom.innerHTML = Math.trunc(zoom * 100) + '%'
  setVerticalSelectorPos(!!sliceX)
}

// transform message
function handleTransformMessage() {
  if (input.value.includes('transform')) {
    transformsMessage.style.display = 'block'
  } else {
    transformsMessage.style.display = 'none'
  }
}

// toggle x and y
function toggleX() {
  sliceX = null
  setVerticalSelectorPos(false)
  isX = !isX
  setSliceStats()
}
function toggleY() {
  sliceY = null
  setHorizontalSelectorPos(false)
  isY = !isY
  setSliceStats()
}

// output format tabs
function tabClickHandler(e: MouseEvent) {
  const target = e.target as HTMLElement
  const selectedType = target.dataset.type as OutputType
  if (outputType == selectedType) return
  setOutputFormat(selectedType)
}
function setOutputFormat(type: OutputType) {
  outputType = type
  tabs.forEach(tab => {
    tab.classList.remove('selected')
    if (tab.dataset.type == type) tab.classList.add('selected')
  })
  output.innerHTML = outputs[outputType]
}

// process click handler
function processClickHandler() {
  if (!svg) return alert('no input svg')
  if (isX && !targetWidthInput.value || isY && !targetHeightInput.value) return alert('you need to set target size for selected axis')
  if (isX && !sliceX || isY && !sliceY) return alert('you need to set slice point (use mouse)')
  processSvg(targetWidthInput.value, targetHeightInput.value)
}
