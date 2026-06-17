import ast
import math

MAX_COMMANDS = 50
MAX_CODE_LENGTH = 2000
MAX_PRINT_LINES = 20
BLOCKED_IMPORTS = True


class SandboxError(Exception):
    pass


class CodeValidator(ast.NodeVisitor):
    """
    Walks the AST before execution and blocks anything dangerous.
    This runs BEFORE exec() so nothing bad ever executes.
    """
    BLOCKED_CALLS = {"eval", "exec", "compile", "open", "input",
                     "breakpoint", "exit", "quit", "__import__"}

    def visit_Import(self, node):
        raise SandboxError("Imports are not allowed in the sandbox.")

    def visit_ImportFrom(self, node):
        raise SandboxError("Imports are not allowed in the sandbox.")

    def visit_Call(self, node):
        # Block calls like eval(), exec(), open() etc.
        if isinstance(node.func, ast.Name):
            if node.func.id in self.BLOCKED_CALLS:
                raise SandboxError(f"'{node.func.id}()' is not allowed in the sandbox.")
        # Block attribute calls like os.system(), subprocess.run() etc.
        if isinstance(node.func, ast.Attribute):
            if node.func.attr.startswith("__"):
                raise SandboxError(f"Dunder method calls are not allowed.")
        self.generic_visit(node)

    def visit_Attribute(self, node):
        # Block access to dunder attributes like __class__, __globals__
        if node.attr.startswith("__"):
            raise SandboxError(f"Access to '{node.attr}' is not allowed.")
        self.generic_visit(node)

    def visit_Global(self, node):
        raise SandboxError("'global' keyword is not allowed.")


def run_user_code(code: str, robot) -> list:
    if len(code) > MAX_CODE_LENGTH:
        raise SandboxError(f"Code too long (max {MAX_CODE_LENGTH} chars)")

    # Step 1: Parse to AST
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        raise SandboxError(f"Syntax error on line {e.lineno}: {e.msg}")

    # Step 2: Validate AST — blocks imports, eval, exec etc. BEFORE running
    validator = CodeValidator()
    try:
        validator.visit(tree)
    except SandboxError:
        raise

    # Step 3: Compile the validated AST
    try:
        byte_code = compile(tree, filename="<user_code>", mode="exec")
    except Exception as e:
        raise SandboxError(f"Compile error: {str(e)}")

    # Step 4: Build a safe execution environment
    collected_prints = []

    def safe_print(*args, **kwargs):
        if len(collected_prints) < MAX_PRINT_LINES:
            collected_prints.append(" ".join(str(a) for a in args))

    safe_globals = {
        "__builtins__": {
            # Math
            "abs": abs,
            "round": round,
            "min": min,
            "max": max,
            "range": range,
            "len": len,
            "int": int,
            "float": float,
            "str": str,
            "bool": bool,
            "list": list,
            "dict": dict,
            "print": safe_print,
            "math": math,
            # Explicitly nothing else
        }
    }

    safe_locals = {
        "robot": robot,
    }

    # Step 5: Execute
    try:
        exec(byte_code, safe_globals, safe_locals)
    except SandboxError:
        raise
    except Exception as e:
        raise SandboxError(f"Runtime error: {type(e).__name__}: {str(e)}")

    # Step 6: Check command count
    if len(robot.commands) > MAX_COMMANDS:
        raise SandboxError(f"Too many commands (max {MAX_COMMANDS})")

    return collected_prints