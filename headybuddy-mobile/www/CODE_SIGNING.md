<!-- HEADY_BRAND:BEGIN -->
<!-- ╔══════════════════════════════════════════════════════════════════╗ -->
<!-- ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║ -->
<!-- ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║ -->
<!-- ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║ -->
<!-- ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║ -->
<!-- ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║ -->
<!-- ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║ -->
<!-- ║                                                                  ║ -->
<!-- ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║ -->
<!-- ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║ -->
<!-- ║  FILE: headybuddy/CODE_SIGNING.md                                 ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

# Code Signing Guide for HeadyBuddy

## Why Code Signing?

Code signing proves your app is authentic and hasn't been tampered with. Required for:
- Microsoft Store submission
- Windows SmartScreen trust
- User confidence

## Certificate Options

### Option 1: Standard Code Signing Certificate (~$200-400/year)
Providers:
- **DigiCert** - Most trusted, ~$474/year
- **Sectigo** - Affordable, ~$200/year  
- **SSL.com** - Budget option, ~$200/year

### Option 2: EV Code Signing Certificate (~$500-800/year)
- Higher trust level
- Immediate SmartScreen reputation
- Same providers as above

### Option 3: Microsoft Store Submission (Recommended for Store)
- Microsoft signs your app automatically
- No separate certificate needed
- Only works for Store distribution

## Steps to Get Certificate

1. **Choose provider** and purchase Standard Code Signing
2. **Verify identity** (business registration or individual ID)
3. **Receive certificate** (usually USB token or download)
4. **Install certificate** on build machine

## Signing the MSIX

### Using Windows SDK (signtool.exe)

```powershell
# Sign with PFX file
signtool sign /fd SHA256 /a /f "C:\certs\heady.pfx" /p "your-password" "dist\HeadyBuddy-1.0.0.msix"

# Sign with certificate from store
signtool sign /fd SHA256 /a /n "Heady Systems" "dist\HeadyBuddy-1.0.0.msix"

# Verify signature
signtool verify /pa "dist\HeadyBuddy-1.0.0.msix"
```

### Using electron-builder (auto-signing)

Add to package.json:
```json
"win": {
  "certificateFile": "C:/certs/heady.pfx",
  "certificatePassword": "your-password"
}
```

⚠️ **WARNING**: Never commit password to git! Use environment variables.

## Microsoft Store Alternative (Easiest)

If publishing to Microsoft Store only:
1. Upload unsigned MSIX to Partner Center
2. Microsoft signs it automatically
3. No certificate purchase needed

## GitHub Actions Auto-Signing

Create `.github/workflows/sign-release.yml`:
```yaml
name: Sign Release
on:
  release:
    types: [created]
jobs:
  sign:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup certificate
        run: |
          echo "${{ secrets.CERTIFICATE_BASE64 }}" | base64 -d > certificate.pfx
      - name: Build and sign
        run: |
          cd headybuddy
          npm install
          npx electron-builder --win msix
        env:
          WIN_CSC_LINK: certificate.pfx
          WIN_CSC_KEY_PASSWORD: ${{ secrets.CERTIFICATE_PASSWORD }}
```

## Required Secrets for CI/CD

Add to GitHub Secrets:
- `CERTIFICATE_BASE64` - Base64 encoded PFX file
- `CERTIFICATE_PASSWORD` - PFX password

To convert certificate to base64:
```powershell
[Convert]::ToBase64String((Get-Content -Path "certificate.pfx" -Encoding Byte)) | Set-Clipboard
```

## Store Submission Checklist

- [ ] App builds successfully
- [ ] MSIX signed (or use Store signing)
- [ ] Screenshots (minimum 1, recommended 4-8)
- [ ] Store listing description
- [ ] Privacy policy URL
- [ ] Support contact
- [ ] Age rating
- [ ] App category selected

## Resources

- Microsoft Store Policies: https://docs.microsoft.com/en-us/windows/uwp/publish/store-policies
- Windows Dev Center: https://partner.microsoft.com/dashboard
- Electron Code Signing: https://www.electron.build/code-signing
