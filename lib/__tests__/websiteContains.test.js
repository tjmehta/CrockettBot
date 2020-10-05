import websiteContains from '../websiteContains'

describe('websiteContains', () => {
  it('should check if a website contains a string', async () => {
    const notAvail = await websiteContains('https://www.crockettdoodles.com/available-puppies', /NONE AVAILABLE AT THIS TIME/i)
    expect(notAvail).toBe(true)
  });
});
