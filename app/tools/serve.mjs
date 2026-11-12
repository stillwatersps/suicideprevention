// Opens the built app in a web browser on this computer, for a quick look.
//   npm start        (builds first, then prints an address to open)
// It serves app/www to this computer only (127.0.0.1) and nothing else. In a browser the app
// uses stand-ins for what only a phone can do: no real notifications, places, or Messages.
import { serve } from '../test/helpers.mjs';

const { base } = await serve();
console.log(`Tidelight is open at ${base}check-in/ (Spanish: ${base}es/registro-diario/).`);
console.log('It can only be reached from this computer. Press Control and C to stop.');
