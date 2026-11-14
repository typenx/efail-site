# The social-share card for the Efail site, drawn by the engine itself.
import Base
import ./efail/efail.bend as E

def title() -> String:
  "Efail card"

def width() -> U32:
  1200

def height() -> U32:
  630

def background() -> U32:
  E.rgb(11, 22, 34)

type State is Data:
  State{t: U32}

def init(seed: U32) -> State:
  State{0}

def step(+input: E.Input, s: State) -> State:
  s

def ember() -> U32:
  E.rgb(240, 138, 36)

def draw(s: State) -> List<E.Shape>:
  List.concat(&1, E.Shape, [
    [E.rect(0.0, 0.0, 1200.0, 12.0, ember()),
     E.rect(1010.0, 70.0, 84.0, 84.0, ember()),
     E.rect(900.0, 210.0, 52.0, 52.0, ember()),
     E.rect(1090.0, 330.0, 40.0, 40.0, ember()),
     E.rect(940.0, 420.0, 64.0, 64.0, ember()),
     E.rect(1000.0, 560.0, 130.0, 30.0, E.rgb(46, 204, 113))],
    E.text("EFAIL", 72.0, 76.0, 20.0, ember()),
    E.text("THE GAME ENGINE", 72.0, 236.0, 10.0, E.white()),
    E.text("BUILT FOR", 72.0, 306.0, 10.0, E.white()),
    E.text("AI AGENTS", 472.0, 306.0, 10.0, ember()),
    E.text("DETERMINISTIC 2D + LOW-POLY 3D.", 72.0, 410.0, 4.0, E.rgb(155, 172, 192)),
    E.text("ONE FILE OF PURE FUNCTIONS.", 72.0, 446.0, 4.0, E.rgb(155, 172, 192)),
    E.text("> EFAIL CHECK   > EFAIL SIM   > EFAIL SHOT", 72.0, 548.0, 4.0, E.rgb(46, 204, 113))
  ])

def show(s: State) -> String:
  "card"
