export default {
  async fetch(req) {
    try {
      const url = new URL(req.url);
      const path = url.pathname;
      const query = url.searchParams;

      if (path === "/search") {
        const q = query.get("query");
        if (!q) return new Response("Missing ?query", { status: 400 });

        const res = await fetch(`https://api.consumet.org/anime/gogoanime/${encodeURIComponent(q)}`);
        const json = await res.json();

        if (!json.results) return Response.json({ error: "No results" });

        return Response.json(json.results.map(a => ({
          id: a.id,
          title: a.title,
          image: a.image,
          releaseDate: a.releaseDate,
          type: a.type,
        })));
      }

      if (path === "/episodes") {
        const id = query.get("id");
        if (!id) return new Response("Missing ?id", { status: 400 });

        const res = await fetch(`https://api.consumet.org/anime/gogoanime/info/${id}`);
        const json = await res.json();

        return Response.json({
          title: json.title,
          image: json.image,
          description: json.description,
          totalEpisodes: json.totalEpisodes,
          episodes: (json.episodes || []).map(e => ({
            id: e.id,
            number: e.number,
            title: e.title || `Episode ${e.number}`,
          }))
        });
      }

      if (path === "/watch") {
        const id = query.get("id");
        if (!id) return new Response("Missing ?id", { status: 400 });

        const res = await fetch(`https://api.consumet.org/anime/gogoanime/watch/${id}`);
        const json = await res.json();

        return Response.json({
          subtitles: json.subtitles || [],
          thumbnail: json.headers?.Referer || null,
          sources: (json.sources || []).map(s => ({
            quality: s.quality,
            isM3U8: s.isM3U8,
            url: s.url,
          })),
          download: json.download || null,
        });
      }

      return new Response("❌ Endpoint Not Found", { status: 404 });

    } catch (err) {
      return new Response(`💥 Internal Error: ${err.message}`, { status: 500 });
    }
  }
};
