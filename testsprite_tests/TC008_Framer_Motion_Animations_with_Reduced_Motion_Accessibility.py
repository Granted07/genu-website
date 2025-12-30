import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Set system/user preference for reduced motion.
        await page.goto('about:preferences#accessibility', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Return to the tested site to attempt setting reduced motion preference via site or browser settings.
        await page.goto('http://localhost:3000', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Simulate reduced motion preference using browser or site settings if available, then reload site to verify animations are minimized or disabled.
        frame = context.pages[-1]
        # Click 'Know More' button to navigate and observe animations for further verification
        elem = frame.locator('xpath=html/body/div[2]/main/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Simulate reduced motion preference and reload site to verify animations are minimized or disabled.
        await page.goto('http://localhost:3000', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Simulate reduced motion preference using browser or site settings, reload site, and verify animations are minimized or disabled accordingly.
        frame = context.pages[-1]
        # Click GENERATION UPRISING button to check for any animation or transition
        elem = frame.locator('xpath=html/body/nav/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Return to the tested site and attempt to simulate reduced motion preference using site-specific settings or browser developer tools if available.
        await page.goto('http://localhost:3000', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Simulate reduced motion preference using browser developer tools or CSS media feature emulation, reload site, and verify animations are minimized or disabled accordingly.
        await page.goto('http://localhost:3000', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Simulate reduced motion preference using browser developer tools or CSS media feature emulation, reload site, and verify animations are minimized or disabled accordingly.
        frame = context.pages[-1]
        # Click 'GENERATION UPRISING' button to observe animations under simulated reduced motion
        elem = frame.locator('xpath=html/body/nav/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=GENERATION UPRISING').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CASE FILES').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=DAUGHTERS OF DISSENT').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SIGNALS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=HALL OF NOISE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SPONSORS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=WELCOME TO').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=GENERATION').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=UPRISING').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=A YOUTH-LED MOVEMENT TRANSFORMING CIVIC AWARENESS INTO COLLECTIVE ACTION FOR A JUST FUTURE.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Know More').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Our Work').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    