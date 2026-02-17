# Testing Roo Code - Quick Guide

## 🚀 How to Test It Right Now

### Step 1: Make Sure Extension is Running

1. **In your original VS Code window** (where you pressed F5):
    - You should see a new VS Code window opened (Extension Development Host)
    - If not, press `F5` again

### Step 2: Open a Test Project

In the **Extension Development Host** window:

1. **File → Open Folder**
2. Choose ANY folder with code (even a simple one):
    - Your own project
    - Or create a test folder:
        ```bash
        mkdir ~/test-roo-code
        cd ~/test-roo-code
        echo "console.log('Hello World');" > test.js
        ```
3. Open that folder in VS Code

### Step 3: Open Roo Code Panel

1. **Click the Roo Code icon** in the left sidebar (looks like a chat/robot icon)
    - OR
2. **Press `Cmd+Shift+P`** (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type: `Roo Code: Focus` or `Roo Code: Open Chat`

### Step 4: Test It!

Type simple requests and watch it work:

#### Test 1: Ask a Question

```
What files are in this directory?
```

#### Test 2: Simple Code Generation

```
Create a file called hello.js with a function that says "Hello World"
```

#### Test 3: Code Analysis

```
What does this codebase do?
```

#### Test 4: Code Modification

```
Add a comment to the top of test.js explaining what it does
```

---

## 🎬 What You Should See

### When It Works:

1. **You type a request** → Roo Code shows "Thinking..."
2. **It analyzes** → You'll see it reading files, executing commands
3. **It responds** → Shows you code, explanations, or makes changes
4. **Files update** → If it writes code, files change in real-time

### Example Flow:

```
You: "Create a function to add two numbers"

Roo Code:
1. [Reading files...]
2. [Generating code...]
3. [Writing file...]
4. ✅ Created add.js with:
   function add(a, b) {
     return a + b;
   }
```

---

## ⚠️ Troubleshooting

### Problem: "No API key configured"

**Solution**:

- Open Settings (`Cmd+,`)
- Search for "Roo Code"
- Set API Provider to "gemini" (you already configured this!)
- Make sure API key is set

### Problem: Extension panel doesn't open

**Solution**:

- Check if Extension Development Host window is active
- Try restarting (stop debugging, press F5 again)

### Problem: Nothing happens when I type

**Solution**:

- Make sure you opened a folder (not just a file)
- Check the Debug Console in original VS Code for errors
- Verify Gemini API key is correct

---

## 🧪 Test Scenarios for Your Challenge

Since you're building hooks, here are things to test:

### Test Current Behavior (Before Hooks):

1. **Write a file**: Ask Roo Code to create a new file

    - Watch: Does it ask permission? (No, currently auto-approves)
    - Watch: Where does it log what it did? (Nowhere yet - that's what you'll build!)

2. **Modify existing file**: Ask it to change code
    - Watch: Does it check if it's allowed? (No)
    - Watch: Is there a trace of what changed? (No - you'll add this!)

### After You Build Hooks:

1. **Intent Check**: Try to write code without selecting an intent

    - Should: Block and ask for intent ID

2. **Scope Check**: Try to edit file outside intent scope

    - Should: Block with "Scope Violation" error

3. **Trace Logging**: After it writes code
    - Should: See entry in `.orchestration/agent_trace.jsonl`

---

## 📊 What to Observe

When testing, pay attention to:

1. **Tool Execution**:

    - What tools does Roo Code use? (read_file, write_file, execute_command)
    - When are they called?
    - How are results returned?

2. **Prompt Flow**:

    - What does the system prompt look like?
    - How does context get injected?
    - Where can you intercept?

3. **Message Flow**:
    - How does webview communicate with extension?
    - Where are messages processed?
    - How can you hook into this?

---

## 🎯 Quick Test Checklist

- [ ] Extension Development Host window opens
- [ ] Can open Roo Code panel
- [ ] Can type a message
- [ ] Roo Code responds (even if just an error)
- [ ] Can see tool execution in action
- [ ] Files can be created/modified

---

## 💡 Pro Tip

**Watch the Debug Console** in your original VS Code window while testing:

- Shows all console.log output
- Shows errors
- Shows what the extension is doing internally

This is GOLD for understanding how Roo Code works!

---

**Now go test it!** 🚀

Try the simplest thing first: "What files are in this directory?"
