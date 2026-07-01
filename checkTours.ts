import { getTourPackages } from './src/lib/firebase';

async function checkTours() {
  const tours = await getTourPackages();
  console.log(tours.map(t => ({ id: t.id, slug: t.slug, name: t.name })));
}

checkTours().catch(console.error);
