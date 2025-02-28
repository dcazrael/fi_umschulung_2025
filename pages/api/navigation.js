import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

const contentDir = path.join(process.cwd(), 'content');

// 🔥 Korrigierte Funktion zum Erstellen der Navigation
function getNavigationStructure(dir = contentDir, parentSlug = []) {
  if (!fs.existsSync(dir)) return {};

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let navigation = {};

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    const category = parentSlug[0]?.replace(/_/g, ' ') || 'Allgemein'; // 🔥 Ordnername als Kategorie
    const slug = [...parentSlug, entry.name.replace(/\.mdx$/, '')];

    if (entry.isDirectory()) {
      // 🔥 Falls es ein Verzeichnis ist, rufe die Funktion rekursiv auf
      Object.assign(navigation, getNavigationStructure(fullPath, slug));
    } else if (entry.name.endsWith('.mdx')) {
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      if (!navigation[category]) navigation[category] = []; // Falls nicht existiert, erstelle die Kategorie

      // 🔥 Artikel hinzufügen
      navigation[category].push({
        title: data.title || slug[slug.length - 1], // Falls kein Titel existiert, nutze den Dateinamen
        slug: `/${slug.join('/')}`,
      });
    }
  });

  return navigation;
}

// 🔥 API-Handler
export default function handler(req, res) {
  const navigation = getNavigationStructure();
  res.status(200).json(navigation);
}
