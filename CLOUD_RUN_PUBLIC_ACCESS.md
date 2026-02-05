# Fix 403 Forbidden when calling the API from the dashboard

Firebase Functions (2nd gen) run on Cloud Run, which **blocks unauthenticated HTTP requests by default** (403 Forbidden). Your Next.js proxy is not using Google identity, so Cloud Run blocks the request before it reaches your function.

**One-time fix:** Allow unauthenticated invocations for the API service so your proxy can call it. Your app still protects the API with the internal secret and verified user id.

Run this in your terminal (replace with your project and region if different):

```bash
gcloud run services update api-ee75wgg5dq --region=us-central1 --no-invoker-iam-check --project=cadence-956b5
```

If that fails (e.g. "service not found"), get the exact Cloud Run service name from:
- [Google Cloud Console → Cloud Run](https://console.cloud.google.com/run?project=cadence-956b5) — the service name is in the list.
- Or from the function URL: `https://SERVICE_NAME-uc.a.run.app` → use `SERVICE_NAME`.

Then run:

```bash
gcloud run services update YOUR_SERVICE_NAME --region=us-central1 --no-invoker-iam-check --project=cadence-956b5
```

After this, reload the dashboard; it should load.
