from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import os

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--window-size=1920,1080")
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def take_screenshot(driver, name):
    time.sleep(1)  # Wait for any animations
    driver.save_screenshot(f"screenshot_{name}.png")

def test_envelope():
    driver = setup_driver()
    try:
        # Start local server
        os.system("start python server.py")
        time.sleep(2)  # Wait for server to start
        
        # Load the page
        driver.get("http://localhost:8000")
        time.sleep(2)  # Wait for page to load
        
        # Take screenshot of initial state
        take_screenshot(driver, "initial")
        
        print("Initial state captured")
        
        # Get computed styles
        envelope = driver.find_element(By.CLASS_NAME, "envelope")
        flap = driver.find_element(By.CLASS_NAME, "envelope-flap")
        
        # Get and print initial styles
        initial_transform = driver.execute_script("return window.getComputedStyle(arguments[0]).transform", envelope)
        initial_flap_transform = driver.execute_script("return window.getComputedStyle(arguments[0]).transform", flap)
        
        print(f"Initial envelope transform: {initial_transform}")
        print(f"Initial flap transform: {initial_flap_transform}")
        
        # Click the envelope
        envelope.click()
        time.sleep(0.5)  # Wait for animation to start
        take_screenshot(driver, "during_animation")
        
        print("Animation state captured")
        
        # Get and print styles during animation
        animation_transform = driver.execute_script("return window.getComputedStyle(arguments[0]).transform", envelope)
        animation_flap_transform = driver.execute_script("return window.getComputedStyle(arguments[0]).transform", flap)
        
        print(f"Animation envelope transform: {animation_transform}")
        print(f"Animation flap transform: {animation_flap_transform}")
        
        time.sleep(1)  # Wait for animation to complete
        take_screenshot(driver, "final")
        
        print("Final state captured")
        
        # Get and print final styles
        final_transform = driver.execute_script("return window.getComputedStyle(arguments[0]).transform", envelope)
        final_flap_transform = driver.execute_script("return window.getComputedStyle(arguments[0]).transform", flap)
        
        print(f"Final envelope transform: {final_transform}")
        print(f"Final flap transform: {final_flap_transform}")
        
    finally:
        driver.quit()
        os.system("taskkill /f /im python.exe")  # Stop the server

if __name__ == "__main__":
    test_envelope()
