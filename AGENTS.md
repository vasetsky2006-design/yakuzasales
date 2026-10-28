<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- AI calls go through Lovable AI Gateway (Responses API, AI SDK) in `*.server.ts` helpers wrapped by `*.functions.ts` server functions; keeps the API key server-side.
- Landing page at / is public and outside AppShell; the operator demo lives under /hub and other module routes.  Why: marketing visitors need context before the app.
- Demo/waitlist requests go to public.demo_requests (anon insert-only, no read).  Why: capture leads without exposing them.
- Remote MCP uses the SDK-generated /mcp endpoint and a separate static public catalog in src/lib/mcp; never import the demo store or database clients there. Why: remote callers must not receive browser-local operational or lead data.
- Browser-local agent read tools register in their owning screens with useWebMCP and shared fail-open telemetry. Why: tools reflect only the currently visible view and unregister on navigation.
