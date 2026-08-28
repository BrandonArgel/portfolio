import { readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

function getFlatKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  let keys: string[] = []

  for (const key in obj) {
    const val = obj[key]
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      keys = keys.concat(getFlatKeys(val as Record<string, unknown>, `${prefix}${key}.`))
    } else {
      keys.push(`${prefix}${key}`)
    }
  }

  return keys
}

async function checkAllLocales() {
  const messagesDir = resolve(process.cwd(), 'src/messages')

  try {
    const files = await readdir(messagesDir)
    const jsonFiles = files.filter((file) => file.endsWith('.json'))

    if (jsonFiles.length === 0) {
      console.error('❌ No JSON files found.')
      process.exit(1)
    }

    console.log(`Starting to check ${jsonFiles.length} locales...`)

    const localesData: Record<string, Set<string>> = {}
    const allKnownKeys = new Set<string>()

    for (const file of jsonFiles) {
      const filePath = join(messagesDir, file)
      const data = (await Bun.file(filePath).json()) as Record<string, unknown>

      const flatKeys = getFlatKeys(data)
      localesData[file] = new Set(flatKeys)

      for (const key of flatKeys) {
        allKnownKeys.add(key)
      }
    }

    console.log(
      `🔍 Analyzing parity across ${jsonFiles.length} locales: ${jsonFiles.join(', ')}...\n`,
    )

    let hasErrors = false

    for (const [fileName, fileKeys] of Object.entries(localesData)) {
      const missingKeys = [...allKnownKeys].filter((key) => !fileKeys.has(key))

      if (missingKeys.length > 0) {
        console.error(`❌ Missing ${missingKeys.length} keys in ${fileName}:`)
        for (const key of missingKeys) {
          console.error(`   - ${key}`)
        }
        hasErrors = true
      }
    }

    if (hasErrors) {
      console.error(
        '\n⚠️ Synchronization failed. Please ensure all JSON files are structurally identical.',
      )
      process.exit(1)
    } else {
      console.log(
        `✅ Perfect synchronization! All ${jsonFiles.length} files have the exact same structure.`,
      )
      process.exit(0)
    }
  } catch (error) {
    console.error(`❌ Error accessing ${messagesDir}. Does the folder exist?`)
    console.error(error)
    process.exit(1)
  }
}

checkAllLocales()
