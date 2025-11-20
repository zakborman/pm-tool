"""Random name generator for guest users."""
import random

ADJECTIVES = [
    "Swift", "Lazy", "Happy", "Clever", "Brave", "Calm", "Bold", "Bright",
    "Cheerful", "Daring", "Eager", "Fancy", "Gentle", "Jolly", "Kind", "Lively",
    "Merry", "Noble", "Proud", "Quick", "Rapid", "Silent", "Sneaky", "Steady",
    "Strong", "Witty", "Wise", "Zealous", "Agile", "Bouncy", "Curious", "Dizzy",
]

ANIMALS = [
    "Alligator", "Penguin", "Dolphin", "Tiger", "Eagle", "Fox", "Bear", "Wolf",
    "Otter", "Panda", "Koala", "Leopard", "Cheetah", "Falcon", "Hawk", "Owl",
    "Rabbit", "Squirrel", "Badger", "Raccoon", "Beaver", "Moose", "Elk", "Deer",
    "Bison", "Buffalo", "Jaguar", "Lynx", "Cougar", "Panther", "Lion", "Zebra",
]


def generate_random_name() -> str:
    """Generate a random name like 'Lazy Alligator' or 'Swift Penguin'."""
    adjective = random.choice(ADJECTIVES)
    animal = random.choice(ANIMALS)
    return f"{adjective} {animal}"
