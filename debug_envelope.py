from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os

def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # Run in headless mode
    options.add_argument('--window-size=800,600')
    return webdriver.Chrome(options=options)

def take_screenshot(driver, name):
    # Create screenshots directory if it doesn't exist
    if not os.path.exists('screenshots'):
        os.makedirs('screenshots')
    
    # Take screenshot
    driver.save_screenshot(f'screenshots/{name}.png')
    print(f'Saved screenshot: {name}.png')

def main():
    driver = setup_driver()
    try:
        # Navigate to the local page
        driver.get('http://localhost:8000')
        
        # Wait for envelope to be present
        envelope = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "envelope"))
        )
        
        # Take screenshot of initial state
        time.sleep(1)  # Wait for any initial animations
        take_screenshot(driver, '1_initial_state')
        
        # Get computed styles
        styles = driver.execute_script("""
            const envelope = document.querySelector('.envelope');
            const flap = document.querySelector('.envelope-flap');
            const content = document.querySelector('.envelope-content');
            const styles = {
                envelope: window.getComputedStyle(envelope),
                flap: window.getComputedStyle(flap),
                content: window.getComputedStyle(content)
            };
            return {
                envelope: {
                    transform: styles.envelope.transform,
                    zIndex: styles.envelope.zIndex,
                    position: styles.envelope.position
                },
                flap: {
                    transform: styles.flap.transform,
                    zIndex: styles.flap.zIndex,
                    position: styles.flap.position
                },
                content: {
                    transform: styles.content.transform,
                    zIndex: styles.content.zIndex,
                    position: styles.content.position
                }
            };
        """)
        
        print("\nInitial Computed Styles:")
        print("Envelope:", styles['envelope'])
        print("Flap:", styles['flap'])
        print("Content:", styles['content'])
        
        # Click the envelope
        envelope.click()
        
        # Take screenshots during animation
        for i in range(1, 6):
            time.sleep(0.1)
            take_screenshot(driver, f'2_animation_frame_{i}')
        
        # Take final screenshot after animation
        time.sleep(0.5)
        take_screenshot(driver, '3_final_state')
        
        # Get final computed styles
        styles = driver.execute_script("""
            const envelope = document.querySelector('.envelope');
            const flap = document.querySelector('.envelope-flap');
            const content = document.querySelector('.envelope-content');
            const styles = {
                envelope: window.getComputedStyle(envelope),
                flap: window.getComputedStyle(flap),
                content: window.getComputedStyle(content)
            };
            return {
                envelope: {
                    transform: styles.envelope.transform,
                    zIndex: styles.envelope.zIndex,
                    position: styles.envelope.position
                },
                flap: {
                    transform: styles.flap.transform,
                    zIndex: styles.flap.zIndex,
                    position: styles.flap.position
                },
                content: {
                    transform: styles.content.transform,
                    zIndex: styles.content.zIndex,
                    position: styles.content.position
                }
            };
        """)
        
        print("\nFinal Computed Styles:")
        print("Envelope:", styles['envelope'])
        print("Flap:", styles['flap'])
        print("Content:", styles['content'])
        
    finally:
        driver.quit()

if __name__ == '__main__':
    main()
