const input: HTMLTextAreaElement = document.querySelector('#input')
const output: HTMLTextAreaElement = document.querySelector('#output')
const svgWrapper: HTMLElement = document.querySelector('#svg-wrapper')
const outputSvgWrapper: HTMLElement = document.querySelector('#output-svg-wrapper')
const verticalSelector: HTMLElement = document.querySelector('#vertical-selector')
const main: HTMLElement = document.querySelector('#main')

const targetWidthInput: HTMLInputElement = document.querySelector('#target-width')
const resetButton: HTMLElement = document.querySelector('#reset-button')
const processButton: HTMLElement = document.querySelector('#process-button')
const themeButton: HTMLElement = document.querySelector('#theme-button')

let svg: SVGElement = null
let svgWidth: number = null
let svgHeight: number = null
let sliceX: number = null
let targetWidth: string = null
let numberTargetWidth: number = null
let theme = '#060606'

const statsWidth: HTMLElement = document.querySelector('#stats-width')
const statsHeight: HTMLElement = document.querySelector('#stats-height')
const statsSlice: HTMLElement = document.querySelector('#stats-slice')

input.addEventListener('input', inputHandler)
svgWrapper.addEventListener('mousemove', mouseMoveHandler)
svgWrapper.addEventListener('mouseleave', svgLeaveHandler)
svgWrapper.addEventListener('click', svgClickHandler)
processButton.addEventListener('click', processSvg)
resetButton.addEventListener('click', resetSlice)
themeButton.addEventListener('click', changeTheme)
document.addEventListener('drop', dropHandler)

function inputHandler() {
  resetSlice()
  setOutput()
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

function processSvg() {
  targetWidth = targetWidthInput.value
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
  setOutput(output)
  setVerticalSelectorPos(true)
}

function processPath(d: string) {
  const inputPath = d.replace(/\sd="([^"]+)"/, '$1')
  let outputPath = ''

  let regex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]+)?/gm
  const allCommands = inputPath.match(regex)
  regex = new RegExp(regex, '')

  let absoluteX = 0
  let absoluteY = 0

  allCommands.forEach(command => {
    const match = command.match(regex)
    let commandKey = match[1]
    const commandValue = match[2]?.trim()
    const valueSplit = commandValue?.split(/[\s,]|(?=-)/) || []
    let processedValues = []

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
  })

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
  if (html.includes('<svg') && numberTargetWidth) {
    outputSvgWrapper.innerHTML = html
    outputSvgWrapper.style.width = targetWidth + 'px'
    outputSvgWrapper.style.height = svgHeight + 'px'
  } else {
    outputSvgWrapper.innerHTML = html ? 'dynamic preview not available' : ''
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
