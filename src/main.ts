const input: HTMLTextAreaElement = document.querySelector('#input')
const output: HTMLTextAreaElement = document.querySelector('#output')
const svgWrapper: HTMLElement = document.querySelector('#svg-wrapper')
const outputSvgWrapper: HTMLElement = document.querySelector('#output-svg-wrapper')
const verticalSelector: HTMLElement = document.querySelector('#vertical-selector')
const main: HTMLElement = document.querySelector('#main')
const imagesWrapper: HTMLElement = document.querySelector('#images-wrapper')

const targetWidthInput: HTMLInputElement = document.querySelector('#target-width')
const resetButton: HTMLElement = document.querySelector('#reset-button')
const processButton: HTMLElement = document.querySelector('#process-button')
const themeButton: HTMLElement = document.querySelector('#theme-button')
const zoomInButton: HTMLElement = document.querySelector('#zoom-in-button')
const zoomOutButton: HTMLElement = document.querySelector('#zoom-out-button')

let svg: SVGElement = null
let svgWidth: number = null
let svgHeight: number = null
let sliceX: number = null
let targetWidth: string = null
let numberTargetWidth: number = null
let theme = '#060606'
let zoom = 1
let outputInterval: number = null

const statsWidth: HTMLElement = document.querySelector('#stats-width')
const statsHeight: HTMLElement = document.querySelector('#stats-height')
const statsSlice: HTMLElement = document.querySelector('#stats-slice')
const statsZoom: HTMLElement = document.querySelector('#stats-zoom')

input.addEventListener('input', inputHandler)
svgWrapper.addEventListener('mousemove', mouseMoveHandler)
svgWrapper.addEventListener('mouseleave', svgLeaveHandler)
svgWrapper.addEventListener('click', svgClickHandler)
processButton.addEventListener('click', () => processSvg(targetWidthInput.value))
resetButton.addEventListener('click', resetSlice)
themeButton.addEventListener('click', changeTheme)
zoomInButton.addEventListener('click', zoomIn)
zoomOutButton.addEventListener('click', zoomOut)
document.addEventListener('drop', dropHandler)

function getSvgCommandLength(cmd: string) {
  const SVG_COMMAND_LENGTHS: { [key: string]: number} = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7 }
  return SVG_COMMAND_LENGTHS[cmd.toLowerCase()]
}

function inputHandler() {
  resetSlice()
  setOutput()
  setZoom(1)
  svgWrapper.innerHTML = input.value
  svg = svgWrapper.querySelector('svg')
  if (svg) {
    svgWidth = parseFloat(svgWrapper.innerHTML.match(/(<svg[^>]+width=")([\d.]+)/)?.[2]) || parseFloat(svgWrapper.innerHTML.match(/(<svg[^>]+viewBox="[\d.]+\s[\d.]+\s)([\d.]+)/)?.[2])
    svgHeight = parseFloat(svgWrapper.innerHTML.match(/(<svg[^>]+height=")([\d.]+)/)?.[2]) || parseFloat(svgWrapper.innerHTML.match(/(<svg[^>]+viewBox="[\d.]+\s[\d.]+\s[\d.]+\s)([\d.]+)/)?.[2])
    console.log(svgWidth, svgHeight)
    setDimensions(svgWidth, svgHeight)
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
  } else {
    svgWrapper.innerHTML = ''
    setDimensions()
    setOutput('invalid svg')
  }
}

function setDimensions(w: string | number = '', h: string | number = '') {
  svgWrapper.style.width = w ? w + 'px' : ''
  svgWrapper.style.height = h ? h + 'px' : ''
  statsWidth.innerHTML = w + ''
  statsHeight.innerHTML = h + ''
}

function mouseMoveHandler(e: MouseEvent) {
  if (!svg || sliceX) return
  setVerticalSelectorPos(true, e)
}

function setVerticalSelectorPos(show: boolean, e?: MouseEvent) {
  const offsetX = e?.offsetX ?? sliceX
  verticalSelector.style.opacity = show ? '1' : '0'
  verticalSelector.style.height = svgWrapper.clientHeight + 'px'
  verticalSelector.style.top = svgWrapper.offsetTop + 'px'
  verticalSelector.style.left = svgWrapper.offsetLeft + offsetX + 'px'
  verticalSelector.style.width = 1 / zoom + 'px'
}

function svgLeaveHandler() {
  if (sliceX) return
  setVerticalSelectorPos(false)
}

function svgClickHandler(e: MouseEvent) {
  if (!svg) return
  sliceX = e.offsetX
  statsSlice.innerHTML = sliceX + ''
}

function resetSlice() {
  sliceX = null
  setVerticalSelectorPos(false)
  statsSlice.innerHTML = ''
  setOutput()
}

function changeTheme() {
  theme = theme == '#060606' ? '#fbfbfb' : '#060606'
  main.style.background = theme
}

function p(str: string, condition = !numberTargetWidth) {
  return condition ? str : ''
}

function processSvg(tw: string | number, withOutput = true) {
  targetWidth = tw + ''
  numberTargetWidth = Number(targetWidth)
  if (!svg || !sliceX) return
  let output = input.value
  // paths
  let regex = /\sd="[^"]+"/gm
  const allDs = output.match(regex)
  allDs?.forEach(d => {
    const processedD = processPath(d)
    output = output.replace(d, processedD)
  })
  // widths
  regex = /\swidth="([\d.]+)"/gm
  const allWidths = output.match(regex)
  allWidths?.forEach(w => {
    regex = new RegExp(regex, '')
    const width = w.match(regex)[1]
    const processedWidthNumber = processNumber(width)
    const isDynamic = typeof processedWidthNumber == 'string'
    const processedWidth = ` ${p(':', isDynamic)}width="${processedWidthNumber}"`
    output = output.replace(w, processedWidth)
  })
  // x's
  regex = /\sx(\d)?="([\d.]+)"/gm
  const allXs = output.match(regex)
  allXs?.forEach(x => {
    regex = new RegExp(regex, '')
    const match = x.match(regex)
    const xIdx = match[1] ?? ''
    const value = match[2]
    const processedValue = processNumber(value)
    const isDynamic = typeof processedValue == 'string'
    const processedX = ` ${p(':', isDynamic)}x${xIdx}="${processedValue}"`
    output = output.replace(x, processedX)
  })
  // viewbox
  output = output.replace(/(viewBox="[\d.]+\s[\d.]+\s)[\d.]+(\s[\d.]+")/, `${p(':')}$1${ p('${') + targetWidth + p('}')}$2`)
  if (withOutput) {
    setOutput(output)
    setVerticalSelectorPos(true)
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

  for (let allCommandsIdx = 0; allCommandsIdx < allCommands.length; allCommandsIdx++) {
    const command = allCommands[allCommandsIdx]

    const match = command.match(regex)
    let commandKey = match[1]
    const commandValue = match[2]?.trim()
    const valueSplit = commandValue?.split(/[\s,]|(?=-)/).filter(v => v) || []
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
      })
      commandKey = commandKey.toUpperCase()
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

    if (/[VvZz]/.test(commandKey)) {
      // doesn't need processing
      processedValues = valueSplit
    } else {
      // needs processing
      let counter = 0
      while (valueSplit.length) {
        counter++
        let n = valueSplit.shift()
        if (counter % 2 == 1) {
          // x
          const processedN = processNumber(n)
          if (typeof processedN == 'string') {
            n = '${' + processedN + '}'
          } else {
            n = processedN + ''
          }
        } else {
          // y
        }
        processedValues.push(n)
      }
    }
    outputPath += commandKey + ' ' + processedValues.join(' ') + ' '
  }

  outputPath = outputPath.trimEnd()
  const isDynamic = outputPath.includes('${')
  outputPath = ` ${p(':', isDynamic)}d="${p('`', isDynamic) + outputPath + p('`', isDynamic)}"`
  return outputPath
}

function processNumber(n: string) {
  const float = parseFloat(n)
  if (float > sliceX) {
    const distanceFromRight = svgWidth - float
    const dispanceFromRightFixed = Number(distanceFromRight.toFixed(2))
    if (numberTargetWidth) {
      return Number(numberTargetWidth - dispanceFromRightFixed)
    } else {
      return targetWidth + (dispanceFromRightFixed ? ' - ' + dispanceFromRightFixed : '')
    }
  } else {
    return Number(float.toFixed(2))
  }
}

function setOutput(html = '') {
  output.innerHTML = html
  clearInterval(outputInterval)

  function displayOutputSvg(svg: string, width: number, height: number) {
    outputSvgWrapper.innerHTML = svg
    outputSvgWrapper.style.width = width + 'px'
    outputSvgWrapper.style.height = height + 'px'
  }

  if (html.includes('<svg')) {
    if (numberTargetWidth) {
      displayOutputSvg(html, numberTargetWidth, svgHeight)
    } else {
      let addStep = 25
      let additionalWidth = 0
      outputInterval = window.setInterval(() => {
        if (addStep > 0 && additionalWidth > 199) addStep = -25
        else if (addStep < 0 && additionalWidth < 1) addStep = 25
        additionalWidth += addStep
        const resultWidth = svgWidth + additionalWidth
        const svg = processSvg(resultWidth, false)
        displayOutputSvg(svg, resultWidth, svgHeight)
      }, 500)
    }
  } else {
    outputSvgWrapper.innerHTML = ''
    outputSvgWrapper.style.width = ''
    outputSvgWrapper.style.height = ''
  }
}

function dropHandler(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer.files[0]
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = () => {
    input.value = reader.result as string
    inputHandler()
  }
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
