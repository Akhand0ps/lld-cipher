import { Problem } from "../models/Problem";

export const SEED_PROBLEMS: Problem[] = [
  {
    id: "parking-lot-system",
    title: "Multi-Floor Smart Parking Lot",
    tagline: "Design an automated, multi-level parking lot with dynamic vehicle sizing and billing.",
    difficulty: "INTERMEDIATE",
    category: "Object-Oriented Design & State Management",
    description: `A commercial shopping mall requires an automated parking management system spanning multiple levels. 
The system must handle multiple vehicle types (Motorcycle, Compact Car, Large SUV, Electric Vehicle, Truck) and allocate optimal parking spots on arrival.
Upon exit, the system calculates parking fees based on duration and vehicle-specific rate policies.`,
    functionalRequirements: [
      "The parking lot has multiple floors, and each floor has designated spot types (Compact, Large, Motorcycle, EV with Charger).",
      "System must assign the closest available spot matching the vehicle's size upon entry.",
      "Issue an entry ticket containing ticket ID, vehicle license, assigned spot, and entry timestamp.",
      "Calculate fee at exit based on hourly duration and vehicle tier (with optional flat EV charging surcharge).",
      "Real-time display board showing available spots per floor per vehicle type.",
    ],
    nonFunctionalConstraints: [
      "Multiple entry/exit gates operate simultaneously; allocation engine must prevent race conditions and spot double-booking.",
      "Adding a new vehicle type (e.g., Heavy Bus) or pricing strategy (e.g., Peak Hour Surge) must not require modifying core parking logic.",
      "Payment processing and calculation policies must be decoupled from ticket and spot allocation management.",
    ],
    rubric: {
      id: "rubric-parking-lot",
      name: "Parking Lot Architectural Rubric",
      criteria: [
        {
          id: "srp-cohesion",
          name: "Single Responsibility & Cohesion",
          weight: 25,
          description: "Are responsibilities divided cleanly? (e.g., Spot allocation vs Ticket issuance vs Fee calculation)",
          benchmarkGuideline: "Avoid God Object ParkingLot managing tickets, pricing, and hardware gates all in one.",
        },
        {
          id: "coupling-interfaces",
          name: "Loose Coupling & Interface Segregation",
          weight: 20,
          description: "Are domain entities decoupled using polymorphic contracts?",
          benchmarkGuideline: "Interfaces for PaymentProcessor, PricingStrategy, and SpotAllocationStrategy.",
        },
        {
          id: "extensibility-patterns",
          name: "Extensibility & Design Patterns",
          weight: 25,
          description: "Can new vehicle types, spot types, or pricing models be plugged in effortlessly?",
          benchmarkGuideline: "Strategy Pattern for pricing, Factory Pattern for spots/tickets.",
        },
        {
          id: "concurrency-edge-cases",
          name: "Concurrency & Edge Case Handling",
          weight: 20,
          description: "How does the design prevent race conditions during simultaneous entry at multiple gates?",
          benchmarkGuideline: "Atomic spot reservation, synchronized locks, or transactional slot state changes.",
        },
        {
          id: "clarity-justification",
          name: "Design Explanation & Trade-offs",
          weight: 10,
          description: "How clearly are class relationships, trade-offs, and assumptions explained?",
          benchmarkGuideline: "Clear rationale for why specific classes and design patterns were chosen.",
        },
      ],
    },
    starterTemplates: {
      requirementsAnalysis: `// Identify core actors, entities, and primary use cases:
1. Actors: Driver, Entry Gate, Exit Gate, Display Board
2. Core Entities: ParkingLot, ParkingFloor, ParkingSpot, Vehicle, Ticket, Payment
3. Assumptions: Multi-gate concurrent access; flat hourly rates + surge policy`,
      classDesign: `// Define classes, interfaces, and methods:
public enum VehicleType { MOTORCYCLE, COMPACT, LARGE, ELECTRIC }
public enum SpotType { MOTORCYCLE, COMPACT, LARGE, ELECTRIC }

public abstract class Vehicle {
    private String licensePlate;
    private VehicleType type;
}

public interface PricingStrategy {
    double calculateFee(long durationMillis, VehicleType type);
}

public class ParkingLot {
    // Fill in your spot allocation and gate handling logic...
}`,
      relationshipsAndPatterns: `// Design Patterns & Relationships:
// - Strategy Pattern: Used for PricingStrategy (HourlyPricing, SurgePricing)
// - Observer Pattern: Used for DisplayBoard notifying real-time spot updates
// - Concurrency: Synchronized locks on spot assignment to prevent double booking`,
    },
  },
  {
    id: "elevator-dispatch-system",
    title: "Elevator Control & Dispatch System",
    tagline: "Design an intelligent elevator bank managing internal and external user dispatch requests.",
    difficulty: "ADVANCED",
    category: "State Pattern & Dispatch Algorithms",
    description: `A 40-story corporate headquarters has a bank of 4 passenger elevators. 
Passengers can summon elevators from hall panels (external requests: Floor + Direction UP/DOWN) and choose destination floors inside the cabin (internal requests).
The elevator supervisory controller must schedule cars efficiently to minimize passenger wait times.`,
    functionalRequirements: [
      "Manage a bank of N elevators servicing M floors.",
      "Handle external hall calls (source floor, direction) and internal cabin calls (destination floor).",
      "Elevators transition between states: IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN, MAINTENANCE.",
      "Emergency stop, weight overload sensors, and door obstruction safety interlocks.",
    ],
    nonFunctionalConstraints: [
      "Dispatcher algorithm (e.g. SCAN/LOOK algorithm) should be pluggable via Strategy pattern.",
      "Elevator state machine must be robust against illegal transitions (e.g., cannot move while DOOR_OPEN).",
      "Support concurrent button presses from hall and car panels.",
    ],
    rubric: {
      id: "rubric-elevator",
      name: "Elevator System Architectural Rubric",
      criteria: [
        {
          id: "state-machine-design",
          name: "State Pattern & Lifecycle Modeling",
          weight: 25,
          description: "How cleanly are elevator states and transition guards modeled?",
          benchmarkGuideline: "State Pattern with concrete states guarding invalid transitions.",
        },
        {
          id: "dispatch-extensibility",
          name: "Dispatch Strategy & Pluggability",
          weight: 25,
          description: "Is the dispatch scheduling algorithm decoupled from the elevator hardware simulation?",
          benchmarkGuideline: "DispatchStrategy interface (e.g. LookDispatchStrategy, FCFSStrategy).",
        },
        {
          id: "srp-and-cohesion",
          name: "Single Responsibility & Cohesion",
          weight: 20,
          description: "Separation between Cabin, Door, Controller, Dispatcher, and Hall Panel.",
          benchmarkGuideline: "ElevatorCar does not dispatch requests for the entire bank.",
        },
        {
          id: "concurrency-and-safety",
          name: "Concurrency & Safety Invariants",
          weight: 20,
          description: "Handling concurrent floor requests and safety overrides (overload, fire alarm).",
          benchmarkGuideline: "Thread-safe request queues and priority preemption for emergency stops.",
        },
        {
          id: "design-clarity",
          name: "Clarity & Justification",
          weight: 10,
          description: "Explanation of algorithm choice (SCAN vs FCFS) and structural trade-offs.",
          benchmarkGuideline: "Clear justification of data structures for floor requests (e.g., Min/Max heaps, bitsets).",
        },
      ],
    },
  },
  {
    id: "in-memory-pubsub-service",
    title: "In-Memory Pub-Sub / Event Bus",
    tagline: "Design an in-memory topic-based publish-subscribe message broker with consumer groups.",
    difficulty: "INTERMEDIATE",
    category: "Observer Pattern & Concurrency",
    description: `Design a high-throughput, thread-safe in-memory publish-subscribe messaging system like a lightweight Kafka or Redis Pub/Sub.
Publishers send messages to named Topics. Subscribers register handlers to consume messages synchronously or asynchronously.`,
    functionalRequirements: [
      "Support creating Topics and publishing typed/string messages to them.",
      "Support multiple Subscribers subscribing to one or more Topics.",
      "Support Consumer Groups (only one subscriber in a group processes a given message).",
      "Support message retention and offset tracking per consumer.",
    ],
    nonFunctionalConstraints: [
      "Concurrent publishers and concurrent subscribers must not corrupt topic queues or message delivery ordering.",
      "Dead-letter queue (DLQ) support for unhandled subscriber exceptions.",
      "Decoupled push vs pull delivery strategies.",
    ],
    rubric: {
      id: "rubric-pubsub",
      name: "Pub-Sub Architectural Rubric",
      criteria: [
        {
          id: "observer-pattern-modeling",
          name: "Observer Pattern & Subscription Abstraction",
          weight: 25,
          description: "How cleanly are Publisher, Subscriber, Topic, and Handler abstracted?",
          benchmarkGuideline: "Clear Subscriber interface and topic subscription registry.",
        },
        {
          id: "concurrency-thread-safety",
          name: "Concurrency, Offsets & Synchronization",
          weight: 25,
          description: "Safe concurrent publishing, non-blocking reads, and offset advancement.",
          benchmarkGuideline: "Use of ConcurrentLinkedQueue, CopyOnWriteArrayList, or ReadWriteLock.",
        },
        {
          id: "srp-and-modularity",
          name: "Single Responsibility & Modularity",
          weight: 20,
          description: "Decoupling message routing from delivery mechanisms and retention policies.",
          benchmarkGuideline: "MessageBroker coordinates; Topic stores; Dispatcher delivers.",
        },
        {
          id: "fault-tolerance-dlq",
          name: "Fault Tolerance & Retry Policies",
          weight: 15,
          description: "Handling subscriber crash/slow consumer and poison pill messages.",
          benchmarkGuideline: "Configurable retry policy and Dead Letter Queue interface.",
        },
        {
          id: "design-tradeoffs",
          name: "Clarity & Performance Trade-offs",
          weight: 15,
          description: "Push vs Pull model trade-offs explained.",
          benchmarkGuideline: "Sound discussion of memory limits and backpressure handling.",
        },
      ],
    },
  },
];

export interface ProblemRepository {
  findAll(): Promise<Problem[]>;
  findById(id: string): Promise<Problem | null>;
}

export class StaticProblemRepository implements ProblemRepository {
  public async findAll(): Promise<Problem[]> {
    return SEED_PROBLEMS;
  }

  public async findById(id: string): Promise<Problem | null> {
    const found = SEED_PROBLEMS.find((p) => p.id === id);
    return found || null;
  }
}

export const problemRepository = new StaticProblemRepository();
