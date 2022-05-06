const input: HTMLTextAreaElement = document.querySelector('#input')
const output: HTMLTextAreaElement = document.querySelector('#output')
const svgWrapper: HTMLElement = document.querySelector('#svg-wrapper')
const outputSvgWrapper = document.querySelector('#output-svg-wrapper')
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

function inputHandler() {
  resetSlice()
  setOutput()
  svgWrapper.innerHTML = input.value
  svg = svgWrapper.querySelector('svg')
  if (svg) {
    svgWidth = Number(svgWrapper.innerHTML.match(/(<svg[^>]+width=")(\d+)/)[2])
    svgHeight = Number(svgWrapper.innerHTML.match(/(<svg[^>]+height=")(\d+)/)[2])
    statsWidth.innerHTML = svgWidth + ''
    statsHeight.innerHTML = svgWrapper.offsetHeight + ''
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
    statsWidth.innerHTML = ''
    statsHeight.innerHTML = ''
  }
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
    const processedWidth = ` ${p(':')}width="${processedWidthNumber}"`
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
    const processedX = ` ${p(':')}x${xIdx}="${processedValue}"`
    output = output.replace(x, processedX)
  })
  // viewbox
  output = output.replace(/(viewBox="[\d.]+\s[\d.]+\s)[\d.]+(\s[\d.]+")/, `${p(':')}$1${ p('${') + targetWidth + p('}')}$2`)
  setOutput(output)
  setVerticalSelectorPos(true)
}

function processPath(d: string) {
  const inputValue = d.replace(/\sd="([^"]+)"/, '$1')
  
  let regex = /\s?([MHVCZL])\s?/g
  
  const formatted = inputValue.replace(regex, ' $1 ')
  let replaced = formatted
  let processed = ''

  regex = /([MLHCSQTA])([^MmLlHhVvCcSsQqTtAaZz]+)/gm
  const allCommands = formatted.match(regex)
  regex = new RegExp(regex, '')

  const matchedPairs: string[] = []

  allCommands.forEach(command => {
    const match = command.match(regex)
    const commandKey = match[1]
    const commandValue = match[2].trim()
    const valuePairs = commandValue.match(/\S+(\s\S+)?/g)
    matchedPairs.push(...valuePairs)
  })

  matchedPairs.forEach(pair => {
    console.log(pair)
    const pairSplit = pair.split(' ')

    const processedPairSplit0 = processNumber(pairSplit[0])
    if (typeof processedPairSplit0 == 'string') {
      pairSplit[0] = '${' + processedPairSplit0 + '}'
    } else {
      pairSplit[0] = processedPairSplit0 + ''
    }

    if (pairSplit.length > 1) {
      pairSplit[1] = Number(parseFloat(pairSplit[1]).toFixed(2)) + ''
    }

    const newPair = pairSplit.join(' ')
    replaced = processed + replaced.slice(processed.length).replace(pair, newPair)

    processed = replaced.slice(0, replaced.indexOf(newPair) + newPair.length)

  })

  replaced = replaced.trim()
  const isDynamic = replaced.includes('${')
  
  return ` ${p(':', isDynamic)}d="${p('`', isDynamic) + replaced + p('`', isDynamic)}"`
}

function processNumber(n: string) {
  const float = parseFloat(n)
  if (float > sliceX) {
    const distanceFromRight = svgWidth - float
    if (numberTargetWidth) {
      return Number((numberTargetWidth - distanceFromRight).toFixed(2))
    } else {
      return targetWidth + ' - ' + Number(distanceFromRight.toFixed(2))
    }
  } else {
    return Number(float.toFixed(2))
  }
}

function setOutput(html = '') {
  output.innerHTML = html
  if (numberTargetWidth) outputSvgWrapper.innerHTML = html
  else outputSvgWrapper.innerHTML = html ? 'dynamic preview not available' : ''
}
