async function getFixtureData (filename: string): Promise<Response> {
  const fixtureDataResp = await fetch(`${process.env.FIXTURE_DATA_SERVER}/${filename}`, { method: 'GET' })

  if (!fixtureDataResp.ok) throw new Error(`Failed to fetch ${filename}: ${fixtureDataResp.statusText}`)
  if (fixtureDataResp.body == null) throw new Error(`Failed to fetch ${filename}: no body`)

  return fixtureDataResp
}

export async function getFixtureDataUint8Array (filename: string): Promise<Uint8Array> {
  const fixtureDataResp = await getFixtureData(filename)

  return new Uint8Array(await fixtureDataResp.arrayBuffer())
}
