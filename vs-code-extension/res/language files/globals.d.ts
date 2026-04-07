/**
 * Autodesk CAM Post Processor API Type Declarations
 *
 * Provides IntelliSense and hover documentation for .cps / .cpi files.
 * Based on: https://cam.autodesk.com/posts/reference/
 *
 * Copyright (c) 2012-2026 by Autodesk, Inc.
 */
// ---------------------------------------------------------------------------
//  Vector
// ---------------------------------------------------------------------------

/** A 3-component vector (x, y, z). */
declare class Vector {
  constructor(x: number, y: number, z: number);
  /** X component. */
  x: number;
  /** Y component. */
  y: number;
  /** Z component. */
  z: number;
  /** Returns the length (magnitude) of the vector. */
  length: number;
  /** Returns a negated copy of this vector. */
  getNegated(): Vector;
  /** Returns a normalized copy of this vector. */
  getNormalized(): Vector;
  /** Returns the absolute values of the components. */
  getAbsolute(): Vector;
  /** Returns the dot product with the given vector. */
  getProduct(v: Vector): number;
  /** Returns the minimum component value. */
  getMinimum(): number;
  /** Returns the maximum component value. */
  getMaximum(): number;
  /** Returns the Euclidean distance to another point. */
  getDistance(v: Vector): number;
  /** Returns the cross product of this vector with v. */
  cross(v: Vector): Vector;
  /** Returns the dot product with v. */
  dot(v: Vector): number;
  /** Adds two vectors. */
  static sum(a: Vector, b: Vector): Vector;
  /** Subtracts b from a. */
  static diff(a: Vector, b: Vector): Vector;
  /** Returns true if this vector equals v (within tolerance). */
  isEqual(v: Vector): boolean;
  /** Returns true if this is a zero vector (within tolerance). */
  isZero(): boolean;
  /** Returns true if this vector is non-zero. */
  isNonZero(): boolean;
  /** Returns the component value at the given index (0=x, 1=y, 2=z). */
  getCoordinate(index: number): number;
  /** Sets the component value at the given index. */
  setCoordinate(index: number, value: number): void;
  toString(): string;
}

// ---------------------------------------------------------------------------
//  VectorPair
// ---------------------------------------------------------------------------

/** A pair of vectors. Returned by polar mode activation. */
declare class VectorPair {
  /** The first vector. */
  first: Vector;
  /** The second vector. */
  second: Vector;
}

// ---------------------------------------------------------------------------
//  Matrix
// ---------------------------------------------------------------------------

/** A 3×3 rotation/orientation matrix. */
declare class Matrix {
  constructor();
  /** Returns the forward direction (first column). */
  getForward(): Vector;
  /** Returns the up direction (second column). */
  getUp(): Vector;
  /** Returns the right direction (third column). */
  getRight(): Vector;
  /** Returns the transposed matrix. */
  getTransposed(): Matrix;
  /** Returns the Euler angles for a given convention. */
  getEuler(convention: number): Vector;
  /** Returns the Euler angles as ZYZ. */
  getEuler2(convention: number): Vector;
  /** Returns true if this is an identity matrix. */
  isIdentity(): boolean;
  /** Multiplies this matrix by another. */
  multiply(m: Matrix): Matrix;
  /** Sets the X rotation in radians. */
  setXRotation(angle: number): void;
  /** Sets the Y rotation in radians. */
  setYRotation(angle: number): void;
  /** Sets the Z rotation in radians. */
  setZRotation(angle: number): void;
}

// ---------------------------------------------------------------------------
//  Range
// ---------------------------------------------------------------------------

/** A numeric range with minimum and maximum values. */
declare class Range {
  /** The minimum value. */
  getMinimum(): number;
  /** The maximum value. */
  getMaximum(): number;
  /** Returns true if the range is non-degenerate. */
  isNonDegenerate(): boolean;
}

// ---------------------------------------------------------------------------
//  BoundingBox
// ---------------------------------------------------------------------------

/** An axis-aligned bounding box. */
declare class BoundingBox {
  /** Returns the lower-left-bottom corner. */
  lower: Vector;
  /** Returns the upper-right-top corner. */
  upper: Vector;
  /** Returns the X range. */
  getXRange(): Range;
  /** Returns the Y range. */
  getYRange(): Range;
  /** Returns the Z range. */
  getZRange(): Range;
}

// ---------------------------------------------------------------------------
//  FormatNumber
// ---------------------------------------------------------------------------

/** A number formatter created with `createFormat()`. */
declare class FormatNumber {
  /** Formats a value into a string. Returns empty string if unchanged from previous call (modal). */
  format(value: number): string;
  /** Returns the result unit scaling factor. */
  getResultingValue(value: number): number;
  /** Returns true if the value would produce output (i.e., differs from cached value). */
  areDifferent(a: number, b: number): boolean;
  /** Returns the minimum number of decimals. */
  getMinimumDecimals(): number;
  /** Returns the number of decimals. */
  getNumberOfDecimals(): number;
  /** Returns the error from rounding. */
  getError(value: number): number;
  /** Returns true if this format uses a signed representation. */
  isSignedFormat(): boolean;
}

/** An alias for FormatNumber. */
declare type Format = FormatNumber;

// ---------------------------------------------------------------------------
//  OutputVariable / Variable / Modal / IncrementalVariable / ReferenceVariable
// ---------------------------------------------------------------------------

/** An output variable created with `createOutputVariable()`. Combines a prefix, format, and force logic. */
declare class OutputVariable {
  /** Formats the value, prepending the prefix. Returns empty string if not forced and value unchanged. */
  format(value: number): string;
  /** Returns the current (cached) value. */
  getCurrent(): number;
  /** Resets the variable so the next call forces output. */
  reset(): void;
  /** Disables output until reset. */
  disable(): void;
  /** Enables output. */
  enable(): void;
  /** Returns the prefix string. */
  getPrefix(): string;
  /** Sets the prefix string. */
  setPrefix(prefix: string): void;
}

/** A simple modal variable created with `createVariable()`. */
declare class Variable {
  /** Formats the value. Returns empty string if unchanged. */
  format(value: number): string;
  /** Returns the current value. */
  getCurrent(): number;
  /** Resets the variable so the next call forces output. */
  reset(): void;
}

/** A modal value with a string prefix, created with `createModal()`. */
declare class Modal {
  /** Formats the value, prepending the prefix. Returns empty string if unchanged. */
  format(value: number): string;
  /** Returns the current value. */
  getCurrent(): number;
  /** Resets the modal. */
  reset(): void;
  /** Returns the prefix. */
  getPrefix(): string;
  /** Sets the prefix. */
  setPrefix(prefix: string): void;
}

/** A modal group that enforces mutual exclusivity among multiple modals. */
declare class ModalGroup {
  /** Formats a value for the group member at the given index. */
  format(index: number, value: number): string;
  /** Resets the group, forcing next output. */
  reset(): void;
}

/** An incremental variable created with `createIncrementalVariable()`. */
declare class IncrementalVariable {
  /** Formats the incremental change. */
  format(value: number): string;
  /** Returns the current value. */
  getCurrent(): number;
  /** Resets the variable. */
  reset(): void;
}

/** A reference variable created with `createReferenceVariable()`. */
declare class ReferenceVariable {
  /** Formats the value with a prefix. */
  format(value: number): string;
  /** Returns the current value. */
  getCurrent(): number;
  /** Resets the variable. */
  reset(): void;
}

// ---------------------------------------------------------------------------
//  Tool
// ---------------------------------------------------------------------------

/** Represents a cutting tool.
 * @see https://cam.autodesk.com/posts/reference/classTool.html */
declare class Tool {
  /** The tool number. */
  number: number;
  /** The tool type constant (e.g. TOOL_MILLING_END_FLAT). */
  type: number;
  /** The turret number. */
  turret: number;
  /** The tool diameter. */
  diameter: number;
  /** The corner radius. */
  cornerRadius: number;
  /** The taper angle in radians. */
  taperAngle: number;
  /** The flute length. */
  fluteLength: number;
  /** The shoulder length. */
  shoulderLength: number;
  /** The shaft diameter. */
  shaftDiameter: number;
  /** The body length. */
  bodyLength: number;
  /** The entire length of the tool. */
  overallLength: number;
  /** The number of flutes. */
  numberOfFlutes: number;
  /** The thread pitch (threads per unit length). */
  threadPitch: number;
  /** The coolant mode constant (e.g. COOLANT_FLOOD). */
  coolant: number;
  /** The tool material constant (e.g. MATERIAL_CARBIDE). */
  material: number;
  /** Tool comment. */
  comment: string;
  /** Tool vendor. */
  vendor: string;
  /** Tool product ID. */
  productId: string;
  /** The unit of the tool (MM or IN). */
  unit: number;
  /** The diameter offset (for milling). */
  diameterOffset: number;
  /** The length offset (for milling). */
  lengthOffset: number;
  /** The compensation offset (for turning). */
  compensationOffset: number;
  /** True if break control is enabled. */
  breakControl: boolean;
  /** True if tool must be manually changed. */
  manualToolChange: boolean;
  /** True if the tool is live (not static). */
  liveTool: boolean;
  /** The spindle speed in RPM. Positive for clockwise. */
  spindleRPM: number;
  /** The spindle speed in RPM for ramping. */
  rampingSpindleRPM: number;
  /** The surface speed (CSS). */
  surfaceSpeed: number;
  /** Max spindle speed when using CSS. */
  maximumSpindleSpeed: number;
  /** The spindle mode constant. */
  spindleMode: number;
  /** The holder number. */
  holderNumber: number;
  /** The holder tip diameter. */
  holderTipDiameter: number;
  /** The holder diameter. */
  holderDiameter: number;
  /** The holder length. */
  holderLength: number;
  /** Boring bar orientation in radians. */
  boringBarOrientation: number;
  /** Nose radius for turning tools. */
  noseRadius: number;
  /** Inscribed circle diameter for turning tools. */
  inscribedCircleDiameter: number;
  /** Edge length for turning tools. */
  edgeLength: number;
  /** Relief angle in degrees. */
  reliefAngle: number;
  /** Groove width. */
  grooveWidth: number;
  /** Cross section type for turning tools. */
  crossSection: string;
  /** Holder hand: "Left", "Right", or "Neutral". */
  hand: string;
  /** Tip diameter. */
  getTipDiameter(): number;
  /** Jet distance. */
  jetDistance: number;
  /** Jet diameter. */
  jetDiameter: number;
  /** Kerf width. */
  kerfWidth: number;

  /** Returns the tool number. */
  getNumber(): number;
  /** Returns the tool type constant. */
  getType(): number;
  /** Returns the tool diameter. */
  getDiameter(): number;
  /** Returns the corner radius. */
  getCornerRadius(): number;
  /** Returns the flute length. */
  getFluteLength(): number;
  /** Returns the shoulder length. */
  getShoulderLength(): number;
  /** Returns the shaft diameter. */
  getShaftDiameter(): number;
  /** Returns the body length. */
  getBodyLength(): number;
  /** Returns the overall length. */
  getOverallLength(): number;
  /** Returns the taper angle. */
  getTaperAngle(): number;
  /** Returns the number of flutes. */
  getNumberOfFlutes(): number;
  /** Returns the tapping feedrate. */
  getTappingFeedrate(): number;
  /** Returns the coolant constant. */
  getCoolant(): number;
  /** Returns the material constant. */
  getMaterial(): number;
  /** Returns the tool description. */
  getDescription(): string;
  /** Returns the comment. */
  getComment(): string;
  /** Returns the vendor. */
  getVendor(): string;
  /** Returns the product ID. */
  getProductId(): string;
  /** Returns true if this is a turning tool. */
  isTurningTool(): boolean;
  /** Returns true if this is a jet tool (waterjet/laser/plasma). */
  isJetTool(): boolean;
  /** Returns true if this is a drill type. */
  isDrill(): boolean;
  /** Returns true if spindle direction is clockwise. */
  isClockwise(): boolean;
  /** Returns true if this is a live tool. */
  isLiveTool(): boolean;
  /** Returns the spindle RPM. */
  getSpindleRPM(): number;
  /** Returns the ramping spindle RPM. */
  getRampingSpindleRPM(): number;
  /** Returns the surface speed. */
  getSurfaceSpeed(): number;
  /** Returns the maximum spindle speed. */
  getMaximumSpindleSpeed(): number;
  /** Returns the diameter offset. */
  getDiameterOffset(): number;
  /** Returns the length offset. */
  getLengthOffset(): number;
  /** Returns the unit. */
  getUnit(): number;
  /** Returns the holder number. */
  getHolderNumber(): number;
  /** Returns the boring bar orientation. */
  getBoringBarOrientation(): number;
  /** Returns the thread pitch. */
  getThreadPitch(): number;
  /** Returns the tool ID string. */
  getToolId(): string;
  /** Returns the holder description. */
  getHolderDescription(): string;
  /** Returns the holder comment. */
  getHolderComment(): string;
  /** Returns the holder vendor. */
  getHolderVendor(): string;
  /** Returns the holder product ID. */
  getHolderProductId(): string;
  /** Returns the compensation mode. */
  getCompensationMode(): number;
  /** Returns the insert type. */
  getInsertType(): number;
  /** Returns the holder type. */
  getHolderType(): number;
  /** Returns the turret number. */
  getTurret(): number;
  /** Returns the assembly gauge length. */
  getAssemblyGaugeLength(): number;
}

// ---------------------------------------------------------------------------
//  Section
// ---------------------------------------------------------------------------

/** An NC section — a group of NC data sharing the same work plane, tool, and related data.
 * @see https://cam.autodesk.com/posts/reference/classSection.html */
declare class Section {
  /** The original unit of the section (may differ from output unit). */
  unit: number;
  /** The work origin in the WCS. */
  workOrigin: Vector;
  /** The work plane in the WCS. */
  workPlane: Matrix;
  /** The WCS origin. */
  wcsOrigin: Vector;
  /** The WCS plane. */
  wcsPlane: Matrix;
  /** The work offset corresponding to the WCS. */
  workOffset: number;
  /** The probe work offset. */
  probeWorkOffset: number;
  /** The WCS index. */
  wcsIndex: number;
  /** The WCS string. */
  wcs: string;
  /** The dynamic work offset. */
  dynamicWorkOffset: number;
  /** True if axis substitution is used. */
  axisSubstitution: boolean;
  /** Nominal axis substitution radius. */
  axisSubstitutionRadius: number;
  /** Section type: TYPE_MILLING, TYPE_TURNING, or TYPE_JET. */
  type: number;
  /** Associated quality. */
  quality: number;
  /** True if tailstock is used. */
  tailstock: boolean;
  /** True if part catcher should be activated. */
  partCatcher: boolean;
  /** Active spindle number. */
  spindle: number;
  /** The operation properties map. */
  properties: any;
  /** Strategy type of the section. */
  strategy: string;
  /** Machining type (3-axis, 5-axis, polar, etc.). */
  machiningType: number;
  /** User-specified polar direction. */
  polarDirection: Vector;

  /** Returns the section ID. */
  getId(): number;
  /** Returns the tool for this section. */
  getTool(): Tool;
  /** Returns the unit. */
  getUnit(): number;
  /** Returns the section type (TYPE_MILLING, TYPE_TURNING, TYPE_JET). */
  getType(): number;
  /** Returns true if the section contains multi-axis (5-axis) motion. */
  isMultiAxis(): boolean;
  /** Returns the content flags. */
  getContent(): number;
  /** Returns the work origin. */
  getWorkOrigin(): Vector;
  /** Returns the work plane. */
  getWorkPlane(): Matrix;
  /** Returns the WCS origin. */
  getWCSOrigin(): Vector;
  /** Returns the WCS plane. */
  getWCSPlane(): Matrix;
  /** Returns the work offset. */
  getWorkOffset(): number;
  /** Returns the WCS string. */
  getWCS(): string;
  /** Returns the WCS index. */
  getWCSIndex(): number;
  /** Returns the tool axis. */
  getToolAxis(): number;
  /** Returns the first position. */
  getFirstPosition(): Vector;
  /** Returns the initial position (before any cutting). */
  getInitialPosition(): Vector;
  /** Returns the final position. */
  getFinalPosition(): Vector;
  /** Returns the initial tool axis direction. */
  getInitialToolAxis(): Vector;
  /** Returns the global initial tool axis. */
  getGlobalInitialToolAxis(): Vector;
  /** Returns the initial tool axis as ABC angles. */
  getInitialToolAxisABC(): Vector;
  /** Returns the final tool axis. */
  getFinalToolAxis(): Vector;
  /** Returns the final tool axis as ABC angles. */
  getFinalToolAxisABC(): Vector;
  /** Returns true if the initial spindle is on. */
  getInitialSpindleOn(): boolean;
  /** Returns the initial spindle speed. */
  getInitialSpindleSpeed(): number;
  /** Returns the Z range of the section. */
  getZRange(): Range;
  /** Returns the global Z range. */
  getGlobalZRange(): Range;
  /** Returns the bounding box. */
  getBoundingBox(): BoundingBox;
  /** Returns the global bounding box. */
  getGlobalBoundingBox(): BoundingBox;
  /** Returns the maximum feedrate in the section. */
  getMaximumFeedrate(): number;
  /** Returns the maximum spindle speed. */
  getMaximumSpindleSpeed(): number;
  /** Returns the cutting distance. */
  getCuttingDistance(): number;
  /** Returns the rapid distance. */
  getRapidDistance(): number;
  /** Returns the cycle time in seconds. */
  getCycleTime(): number;
  /** Returns the number of records. */
  getNumberOfRecords(): number;
  /** Returns a record by index. */
  getRecord(id: number): Record;
  /** Returns the number of cycle points. */
  getNumberOfCyclePoints(): number;
  /** Returns the movement flags. */
  getMovements(): number;
  /** Returns the maximum tilt angle. */
  getMaximumTilt(): number;
  /** Returns true if the section has the named parameter. */
  hasParameter(name: string): boolean;
  /** Returns the value of the named parameter. */
  getParameter(name: string, defaultValue?: any): any;
  /** Returns true if a specific cycle is used. */
  hasCycle(uri: string): boolean;
  /** Returns true if any cycle is used. */
  hasAnyCycle(): boolean;
  /** Returns the number of cycles. */
  getNumberOfCycles(): number;
  /** Returns true if a tool change is forced for this section. */
  getForceToolChange(): boolean;
  /** Returns the job ID. */
  getJobId(): number;
  /** Returns the pattern ID. */
  getPatternId(): number;
  /** Returns true if the section is patterned. */
  isPatterned(): boolean;
  /** Returns the channel. */
  getChannel(): number;
  /** Returns true if the section is optional. */
  isOptional(): boolean;
  /** Returns the feed mode. */
  getFeedMode(): number;
  /** Returns the tool orientation. */
  getToolOrientation(): number;
  /** Returns true if this section has a well-defined position. */
  hasWellDefinedPosition(): boolean;
  /** Returns the strategy. */
  getStrategy(): string | undefined;
  /** Returns the machining type. */
  getMachiningType(): number;
  /** Returns a global position from a section-local position. */
  getGlobalPosition(p: Vector): Vector;
  /** Returns a WCS position from a section-local position. */
  getWCSPosition(p: Vector): Vector;
  /** Returns true if the toolpath belongs to the given strategy group(s). */
  checkGroup(groups: number): boolean;
  /** Returns true if the work plane is top (Z-up). */
  isTopWorkPlane(): boolean;
  /** Returns true if section is X-oriented. */
  isXOriented(): boolean;
  /** Returns true if section is Y-oriented. */
  isYOriented(): boolean;
  /** Returns true if section is Z-oriented. */
  isZOriented(): boolean;
  /** Returns the global work origin. */
  getGlobalWorkOrigin(): Vector;
  /** Returns the global work plane. */
  getGlobalWorkPlane(): Matrix;
  /** Returns the FCS origin. */
  getFCSOrigin(): Vector;
  /** Returns the FCS plane. */
  getFCSPlane(): Matrix;
  /** Returns true if the section has a dynamic work offset. */
  hasDynamicWorkOffset(): boolean;
  /** Returns the dynamic work offset. */
  getDynamicWorkOffset(): number;
  /** Optimizes machine angles for this section. */
  optimizeMachineAnglesByMachine(machine: MachineConfiguration, optimizeType: number): void;
  /** Returns true if the section is optimized for a machine. */
  isOptimizedForMachine(): boolean;
  /** Returns the lower tool axis ABC limits. */
  getLowerToolAxisABC(): Vector;
  /** Returns the upper tool axis ABC limits. */
  getUpperToolAxisABC(): Vector;
}

// ---------------------------------------------------------------------------
//  Record
// ---------------------------------------------------------------------------

/** A single NC record. */
declare class Record {
  /** Returns the type of the record (e.g. RECORD_LINEAR). */
  getType(): number;
  /** Returns true if a named parameter is available. */
  hasParameter(name: string): boolean;
  /** Returns the parameter value. */
  getParameter(name: string): any;
  /** Returns true if this is a motion record. */
  isMotion(): boolean;
  /** Returns true if this is a parameter record. */
  isParameter(): boolean;
}

// ---------------------------------------------------------------------------
//  MachineConfiguration
// ---------------------------------------------------------------------------

/** Machine configuration describing the kinematic chain.
 * @see https://cam.autodesk.com/posts/reference/classMachineConfiguration.html */
declare class MachineConfiguration {
  /** Returns the number of axes. */
  getNumberOfAxes(): number;
  /** Returns an axis by index. */
  getAxisByCoordinate(coordinate: number): Axis;
  /** Returns true if the machine is multi-axis. */
  isMultiAxisConfiguration(): boolean;
  /** Returns true if the machine has a head axis. */
  isHeadConfiguration(): boolean;
  /** Returns true if the machine has a table axis. */
  isTableConfiguration(): boolean;
  /** Returns the machine ABC from a tool vector. */
  getABC(orientation: Matrix): Vector;
  /** Returns the preferred ABC given a current ABC. */
  getPreferredABC(abc: Vector): Vector;
  /** Returns the ABC as remapped through the machine. */
  remapABC(abc: Vector): Vector;
  /** Returns the retract plane. */
  getRetractPlane(): number;
  /** Sets the retract plane. */
  setRetractPlane(value: number): void;
  /** Returns true if a retract plane is defined. */
  hasRetractPlane(): boolean;
  /** Returns the home position. */
  getHomePositionX(): number;
  getHomePositionY(): number;
  getHomePositionZ(): number;
  /** Sets the model. */
  setModel(model: string): void;
  /** Sets the description. */
  setDescription(description: string): void;
  /** Sets the vendor. */
  setVendor(vendor: string): void;
  /** Sets the number of axes. */
  setNumberOfAxes(n: number): void;
  /** Returns the spindle axis (as Vector). */
  getSpindleAxis(): Vector;
  /** Sets the spindle axis. */
  setSpindleAxis(axis: Vector): void;
}

// ---------------------------------------------------------------------------
//  Axis
// ---------------------------------------------------------------------------

/** A machine axis definition. */
declare class Axis {
  /** Returns true if the axis is enabled. */
  isEnabled(): boolean;
  /** Returns the axis coordinate index. */
  getCoordinate(): number;
  /** Returns the range of the axis. */
  getRange(): Range;
  /** Returns true if the axis is cyclic. */
  isCyclic(): boolean;
  /** Returns true if the axis is a table axis. */
  isTable(): boolean;
  /** Returns true if the axis is a head axis. */
  isHead(): boolean;
  /** Returns true if the axis supports TCP. */
  isTCPEnabled(): boolean;
  /** Returns the effective axis direction vector. */
  getAxis(): Vector;
  /** Returns the axis offset. */
  getOffset(): Vector;
}

// ---------------------------------------------------------------------------
//  MachineParameters
// ---------------------------------------------------------------------------

/** Machine-specific parameters set via `machineParameters`. */
declare class MachineParameters {
  /** The chip breaking distance (for drilling cycles). */
  chipBreakingDistance: number;
  /** The drilling safe distance. */
  drillingSafeDistance: number;
  /** The spindle orientation angle in radians. */
  spindleOrientation: number;
}

// ---------------------------------------------------------------------------
//  ToolTable
// ---------------------------------------------------------------------------

/** A table of tools used in the program. */
declare class ToolTable {
  /** Returns the number of tools. */
  getNumberOfTools(): number;
  /** Returns the tool at the given index. */
  getTool(index: number): Tool;
}

// ---------------------------------------------------------------------------
//  MoveLength
// ---------------------------------------------------------------------------

/** Provides segment lengths for multi-axis moves. */
declare class MoveLength {
  /** The total move length. */
  getRadialLength(): number;
  /** The XYZ linear distance. */
  getLinearLength(): number;
  /** Returns the ABC angular lengths. */
  getABCLength(): Vector;
}

// ---------------------------------------------------------------------------
//  CircularMotion
// ---------------------------------------------------------------------------

/** Full description of a circular motion segment. */
declare class CircularMotion {
  center: Vector;
  normal: Vector;
  plane: number;
  radius: number;
  sweep: number;
  clockwise: boolean;
}

// ---------------------------------------------------------------------------
//  Simulation
// ---------------------------------------------------------------------------

/** Machine simulation interface. */
declare class Simulation {
  /** Writes a simulation record. */
  write(command: string): void;
}

// ---------------------------------------------------------------------------
//  TextFile
// ---------------------------------------------------------------------------

/** File I/O for text files. */
declare class TextFile {
  constructor(path: string, write: boolean, encoding?: string);
  /** Reads a line. */
  readln(): string;
  /** Writes text. */
  write(text: string): void;
  /** Writes a line. */
  writeln(text: string): void;
  /** Closes the file. */
  close(): void;
  /** Returns true if at end-of-file. */
  isOpen(): boolean;
}

// ---------------------------------------------------------------------------
//  FileSystem
// ---------------------------------------------------------------------------

/** Static file system utilities. */
declare class FileSystem {
  static isFolder(path: string): boolean;
  static isFile(path: string): boolean;
  static getCombinedPath(a: string, b: string): string;
  static getFolderPath(path: string): string;
  static getFilename(path: string): string;
  static replaceExtension(path: string, ext: string): string;
  static getTemporaryFolder(): string;
  static getTemporaryFile(prefix: string): string;
  static remove(path: string): void;
  static copyFile(src: string, dest: string): void;
}

// ---------------------------------------------------------------------------
//  StringSubstitution
// ---------------------------------------------------------------------------

/** String substitution/template engine. */
declare class StringSubstitution {
  constructor();
  setValue(key: string, value: any): void;
  substitute(template: string): string;
}

// ---------------------------------------------------------------------------
//  Cycle parameters (available via the `cycle` global)
// ---------------------------------------------------------------------------

/** Cycle parameters available through the `cycle` global variable during onCycle/onCyclePoint. */
interface CycleParameters {
  /** The clearance plane (absolute coordinate). */
  clearance: number;
  /** The retract plane (absolute coordinate). */
  retract: number;
  /** The stock plane (absolute coordinate). */
  stock: number;
  /** The depth below the stock plane (positive = below stock). */
  depth: number;
  /** The bottom plane (stock - depth). Calculated by the post processor. */
  bottom: number;
  /** The primary feedrate. For drilling cycles this is the plunging feedrate. */
  feedrate: number;
  /** The plunge feedrate. Defaults to `feedrate` if not specified. */
  plungeFeedrate?: number;
  /** The retraction feedrate. Defaults to `feedrate` if not specified. */
  retractFeedrate?: number;
  /** The incremental/pecking depth. */
  incrementalDepth?: number;
  /** The incremental depth reduction per plunge. */
  incrementalDepthReduction?: number;
  /** The minimum incremental depth per plunge. */
  minimumIncrementalDepth?: number;
  /** Total plunging depth before full retract. */
  accumulatedDepth?: number;
  /** The dwell time in seconds. */
  dwell?: number;
  /** The dwell depth. */
  dwellDepth?: number;
  /** Distance to retract to break chips. */
  chipBreakDistance?: number;
  /** The number of plunges per retract. */
  plungesPerRetract?: number;
  /** The thread pitch (incremental depth per turn). */
  pitch?: number;
  /** The hole diameter. */
  diameter?: number;
  /** The shifting distance. */
  shift?: number;
  /** The shift orientation in radians. */
  shiftOrientation?: number;
  /** The compensated shift orientation. */
  compensatedShiftOrientation?: number;
  /** The shift direction in radians. */
  shiftDirection?: number;
  /** Back boring distance. */
  backBoreDistance?: number;
  /** Compensation type: "computer", "control", "wear", "inverseWear". */
  compensation?: string;
  /** Specifies climb/conventional milling direction. */
  direction?: string;
  /** Specifies left/right handed thread. */
  threading?: string;
  /** Number of passes/steps. */
  numberOfSteps?: number;
  /** Maximum stepover between passes. */
  stepover?: number;
  /** Stop spindle during positioning. */
  stopSpindle?: boolean;
  /** Repeat the final pass. */
  repeatPass?: boolean;
  /** Positioning spindle speed. */
  positioningSpindleSpeed?: number;
  /** Positioning feedrate. */
  positioningFeedrate?: number;
  /** Incremental distance along Z. */
  incrementalZ?: number;
  /** Incremental distance along X. */
  incrementalX?: number;
  /** Allow arbitrary additional cycle properties. */
  [key: string]: any;
}

// ===========================================================================
//  GLOBAL CONFIGURATION VARIABLES
//  Set at the top level of a .cps file to configure the post processor.
// ===========================================================================

/** Description for the post processor configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a76d2b0133d83c43dfd8a19286ac55325 */
declare var description: string;

/** The vendor of the post processor configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a0e91253390b868169cfe091c815515b5 */
declare var vendor: string;

/** Legal comment for the post processor configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#abd2245ee2db73566a517313ab7341618 */
declare var legal: string;

/** Specifies the minimum allowed revision of the post processor (defaults to 1).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aaf3300f01a676287e5bb963fb8810cb5 */
declare var minimumRevision: number;

/** The default filename (defaults to program name).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ae59f2daabb9fbadf96ab4fceb44d6f77 */
declare var filename: string;

/** Specifies the capability flags. CAPABILITY_MILLING, CAPABILITY_TURNING, CAPABILITY_JET, CAPABILITY_SETUP_SHEET, CAPABILITY_INTERMEDIATE, and CAPABILITY_CASCADING. The default is "CAPABILITY_MILLING".
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a201e06654b2b8875b11c419093b607b2 */
declare var capabilities: number;

/** Linearization tolerance.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a40f244d9f6d9ededaacd92c57c78a318 */
declare var tolerance: number;

/** The minimum chord length in millimeters. Not used for full circle motion.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a391ac41ffa378246cc556ff9a481c7ef */
declare var minimumChordLength: number;

/** The minimum circular radius in millimeters.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ac26721edd5466a7953a79f04f50461ac */
declare var minimumCircularRadius: number;

/** The maximum circular radius in millimeters.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ace7d1f00e4410e1f4baf57b8c29c8c02 */
declare var maximumCircularRadius: number;

/** The minimum circular sweep in radians.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8b0a3da10984e4aa76b26dfa25a757a1 */
declare var minimumCircularSweep: number;

/** The maximum circular sweep in radians.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ac3cde96c729ef76f069a1a2ebfcf5d0d */
declare var maximumCircularSweep: number;

/** Specifies that helical motion is allowed. The helical motion is linearized if false.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#adea8014cc3c4028a10b12ca27a224698 */
declare var allowHelicalMoves: boolean;

/** Specifies that spiral motion is allowed (i.e. the start and end radii are different). The spiral motion is linearized if false.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9d4c62f202e89bd94d79d5ce89b27e9a */
declare var allowSpiralMoves: boolean;

/** Specifies the allowed circular planes to be output. Set to 0 to linearize all circular motion and undefined to allow any motion. Circular motion in disabled planes will be output as linear motion using the globally specified tolerance. allowedCircularPlanes is a bit mask. PLANE_XY, PLANE_ZX, and PLANE_YZ can be used for accessing the appropriate bits. Handling all planes in onCircular() gives more flexibility with regard to the used tolerances.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8862ca499e5a7a3cfc4ece721f91b4b0 */
declare var allowedCircularPlanes: number | undefined;

/** Specifies the high feedrate for rapid traversal to high feed mapping.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#abeabefafe235ec1a3b842eb1e28e9e92 */
declare var highFeedrate: number;

/** Specifies the high feed mapping mode for rapid traversal.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aac46c23bdff2208b8f8120a9fb14e3f6 */
declare var highFeedMapping: number;

/** The output unit (defaults to the specified measurement system in the regional settings).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aa63cd118027e6af31ecb0a9a45085e43 */
declare var unit: number;

/** Specifies that the section origin should be mapped to (0, 0, 0). When disabled the post is responsible for handling the section origin. By default this is enabled. This is a special variable, and, therefore, it should be put in a comment, as per example.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a243007459395443b0a118597f18a824e */
declare var mapWorkOrigin: boolean;

/** Specifies that the section work plane should be mapped to the WCS. When disabled the post is responsible for handling the WCS and section work plane. By default this is enabled. This is a special variable, and, therefore, it should be put in a comment, as per example.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a98351569a835994527b95d62194f279c */
declare var mapToWCS: boolean;

/** Specifies that the machine configuration may change during post processing when no machine configuration is defined in the post configuration. Only one machine configuration is allowed by default when they are defined/embedded in the toolpath. This property must be set to true to allow multiple machines to be defined during post processing in which case the machine configuration will become active on onSection() calls. Any machine configuration defined in the post configuration always takes precedence.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#abec0571054956f7e2f6b1fa8fa04f62e */
declare var allowMachineChangeOnSection: boolean;

/** Specifies that the program name must be an integer.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a36d2cff7c4101e07a26220b208bdf3ee */
declare var programNameIsInteger: boolean;

/** Specifies the revision of the post processor.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aca13f92beb1248bb96ee122f08faa0e7 */
declare var revision: number;

/** Denies post processing.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aa829286062f601759659bcace02ba09f */
declare var preventPost: boolean;

/** Abort on deprecated function calls. */
declare var abortOnDeprecation: boolean;

/** Set to true to allow probing with multiple features. */
declare var probeMultipleFeatures: boolean;

/** The tolerance in millimeters used to determine if consecutive circular records can be merged into a single record. Specifying a value of 0 will not merge consecutive circular records that are the same circle.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#afb32c52466cdce9a1f230d09b12757a3 */
declare var circularMergeTolerance: number;

/** Specifies the Euler convention used for tilted workplane angles. Set to undefined to use machine angles, or use one of the EULER_* constants (0-23) to specify the convention. See EULER_XYZ_R, EULER_ZXZ_R, EULER_ZYZ_R, etc. The default is undefined .
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a14ae38de8543aaa2165ca2f61d98f3e4 */
declare var eulerConvention: number;

/** Specifies that post supports feed per revolution mode for drilling cycles. It must be explicitly set for both milling or turning posts, if they support it.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9c522363e95855fc00092877eb17ee83 */
declare var allowFeedPerRevolutionDrilling: number;

/** Whether to buffer rotary moves. */
declare var bufferRotaryMoves: boolean;

/** Supported features bitmask. */
declare var supportedFeatures: number;

/** The current section. This property is unspecified outside onSection() and onSectionEnd() invocations.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3f363483663847152552a6c19897c842 */
declare var currentSection: Section;

/** The current tool.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a95ceb07ef37166fe2eb4a49196ec22d2 */
declare var tool: Tool;

/** The current feedrate.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a33ca84fc3441ef9e94208a59659de8e2 */
declare var feedrate: number;

/** The current spindle speed in RPM. Positive for clockwise direction.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#acf8176fc3ff71d9cec8246689c6551a8 */
declare var spindleSpeed: number;

/** The current movement type. The supported types are: MOVEMENT_RAPID, MOVEMENT_LEAD_IN, MOVEMENT_CUTTING, MOVEMENT_LEAD_OUT, MOVEMENT_LINK_TRANSITION, MOVEMENT_LINK_DIRECT, MOVEMENT_RAMP_HELIX, MOVEMENT_RAMP_PROFILE, MOVEMENT_RAMP_ZIG_ZAG, MOVEMENT_RAMP, MOVEMENT_PLUNGE, MOVEMENT_PREDRILL, MOVEMENT_EXTENDED, MOVEMENT_REDUCED, MOVEMENT_FINISH_CUTTING, MOVEMENT_HIGH_FEED, MOVEMENT_DEPOSITING, MOVEMENT_BRIDGING, MOVEMENT_PIERCE_CIRCULAR, MOVEMENT_PIERCE_PROFILE, MOVEMENT_PIERCE_LINEAR, and MOVEMENT_PIERCE.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a797d5b9f2e1a2c5fabbe4707d5beb5f7 */
declare var movement: number;

/** The current radius compensation mode. The modes are: RADIUS_COMPENSATION_OFF, RADIUS_COMPENSATION_LEFT, and RADIUS_COMPENSATION_RIGHT. The current radius compensation. Defaults to RADIUS_COMPENSATION_OFF.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af956c33b96a391f96de8b64ae7ce58a4 */
declare var radiusCompensation: number;

/** The spindle axis. Defaults to TOOL_AXIS_Z.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af3e5d8cfc575aa632c1203a79634aeeb */
declare var spindleAxis: number;

/** Specifies the type of the current cycle in canned cycle mode.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8fae97ae25950a6f22a9abb097b06c23 */
declare var cycleType: string;

/** Specifies the current cycle parameters in canned cycle mode.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#acc223e94c02031add0ecad7bda263ab4 */
declare var cycle: CycleParameters;

/** Specifies that a previous cycle point has been expended for the current cycle. Defaults to false.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aff308c18e5596197b74a5228552b512c */
declare var cycleExpanded: boolean;

/** The initial cycle position.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8c30a2b6f665bd561e959cc8a4e85bd2 */
declare var initialCyclePosition: Vector;

/** The machine configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a754d1d3ad5f53d86f01e30c37444ec7e */
declare var machineConfiguration: MachineConfiguration;

/** Machine parameters.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3278d7f9975131c82562c7b467cb8a0d */
declare var machineParameters: MachineParameters;

/** An interface for telling simulation what to do. E.g. so that connections between toolpaths can be simulated appropriately. See the Detailed Description for the Simulation class.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9959b171e9934828d26b506a04b34dfb */
declare var simulation: Simulation;

/** The user-defined properties that are displayed in the Post Properties table when post processing.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a1e996849c5d6bd0559736d2f8c8ffa1f */
declare var properties: any;

/** The end position of the current motion.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a940a7a1a8031469fdd81f0dae0b28289 */
declare var end: Vector;
/**
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a53097bfd1b066d304e03e4c7a74108ef */
declare var circularCenter: Vector;
/**
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a25cc87f46f5ff0758f642abfb1109145 */
declare var circularNormal: Vector;
/**
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a5eb6bcbaa31920c75afd3b3f06cacb94 */
declare var circularRadius: number;
/**
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aaa50fe2ea8ab3b8f055c0817e29b8e7b */
declare var circularSweep: number;
/** The chord length of the current circular motion (0 for full circles). Since r45991.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a58d49d49182572b08de585be569705ec */
declare var circularChordLength: number;
/** Specifies that the currect circular motion is a full circle. Since r45991.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#afe708b5908722da4800fa430a0ec4892 */
declare var circularFullCircle: boolean;
/**
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a031350ab79bbc11dd1c961d190425ae6 */
declare var circularSpiral: boolean;
/** The helical distance for the currect circular motion. Since r45991.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a6700e5e70ce85caf32565aa750e7060b */
declare var circularHelicalDistance: number;

// ===========================================================================
//  UNIT CONSTANTS
// ===========================================================================

/** Millimeters unit constant. */
declare const MM: number;
/** Inches unit constant. */
declare const IN: number;

// ===========================================================================
//  PLANE CONSTANTS
// ===========================================================================

/** XY circular plane constant. */
declare const PLANE_XY: number;
/** ZX circular plane constant. */
declare const PLANE_ZX: number;
/** YZ circular plane constant. */
declare const PLANE_YZ: number;
/** @deprecated Use PLANE_ZX. */
declare const PLANE_XZ: number;

// ===========================================================================
//  AXIS INDEX CONSTANTS
// ===========================================================================

/** X coordinate index (0). */
declare const X: number;
/** Y coordinate index (1). */
declare const Y: number;
/** Z coordinate index (2). */
declare const Z: number;
/** A rotary index. */
declare const A: number;
/** B rotary index. */
declare const B: number;
/** C rotary index. */
declare const C: number;
/** All rotaries flag. */
declare const ABC: number;

// ===========================================================================
//  TOOL AXIS CONSTANTS
// ===========================================================================

/** Tool axis along X (YZ-plane). */
declare const TOOL_AXIS_X: number;
/** Tool axis along Y (ZX-plane). */
declare const TOOL_AXIS_Y: number;
/** Tool axis along Z (XY-plane). */
declare const TOOL_AXIS_Z: number;

// ===========================================================================
//  CAPABILITY CONSTANTS
// ===========================================================================

declare const CAPABILITY_MILLING: number;
declare const CAPABILITY_TURNING: number;
declare const CAPABILITY_JET: number;
declare const CAPABILITY_SETUP_SHEET: number;
declare const CAPABILITY_INTERMEDIATE: number;
declare const CAPABILITY_MACHINE_SIMULATION: number;

// ===========================================================================
//  FEATURE CONSTANTS
// ===========================================================================

declare const FEATURE_MACHINE_ROTARY_ANGLES: number;

// ===========================================================================
//  RADIUS COMPENSATION CONSTANTS
// ===========================================================================

/** Radius compensation off (center). */
declare const RADIUS_COMPENSATION_OFF: number;
/** Left radius compensation. */
declare const RADIUS_COMPENSATION_LEFT: number;
/** Right radius compensation. */
declare const RADIUS_COMPENSATION_RIGHT: number;

// ===========================================================================
//  COOLANT CONSTANTS
// ===========================================================================

/** Coolant disabled. */
declare const COOLANT_DISABLED: number;
/** Flood coolant. */
declare const COOLANT_FLOOD: number;
/** Mist coolant. */
declare const COOLANT_MIST: number;
/** @deprecated Use COOLANT_THROUGH_TOOL. */
declare const COOLANT_TOOL: number;
/** Through-tool coolant. */
declare const COOLANT_THROUGH_TOOL: number;
/** Air coolant. */
declare const COOLANT_AIR: number;
/** Air through tool. */
declare const COOLANT_AIR_THROUGH_TOOL: number;
/** Suction. */
declare const COOLANT_SUCTION: number;
/** Flood and mist. */
declare const COOLANT_FLOOD_MIST: number;
/** Flood and through-tool. */
declare const COOLANT_FLOOD_THROUGH_TOOL: number;

// ===========================================================================
//  MATERIAL CONSTANTS
// ===========================================================================

declare const MATERIAL_UNSPECIFIED: number;
declare const MATERIAL_HSS: number;
declare const MATERIAL_TI_COATED: number;
declare const MATERIAL_CARBIDE: number;
declare const MATERIAL_CERAMICS: number;

// ===========================================================================
//  TOOL TYPE CONSTANTS
// ===========================================================================

declare const TOOL_UNSPECIFIED: number;
declare const TOOL_DRILL: number;
declare const TOOL_DRILL_CENTER: number;
declare const TOOL_DRILL_SPOT: number;
declare const TOOL_DRILL_BLOCK: number;
declare const TOOL_MILLING_END_FLAT: number;
declare const TOOL_MILLING_END_BALL: number;
declare const TOOL_MILLING_END_BULLNOSE: number;
declare const TOOL_MILLING_CHAMFER: number;
declare const TOOL_MILLING_FACE: number;
declare const TOOL_MILLING_SLOT: number;
declare const TOOL_MILLING_RADIUS: number;
declare const TOOL_MILLING_DOVETAIL: number;
declare const TOOL_MILLING_TAPERED: number;
declare const TOOL_MILLING_LOLLIPOP: number;
declare const TOOL_MILLING_FORM: number;
declare const TOOL_MILLING_THREAD: number;
declare const TOOL_TAP_RIGHT_HAND: number;
declare const TOOL_TAP_LEFT_HAND: number;
declare const TOOL_REAMER: number;
declare const TOOL_BORING_BAR: number;
declare const TOOL_COUNTER_BORE: number;
declare const TOOL_COUNTER_SINK: number;
declare const TOOL_HOLDER_ONLY: number;
declare const TOOL_TURNING_GENERAL: number;
declare const TOOL_TURNING_THREADING: number;
declare const TOOL_TURNING_GROOVING: number;
declare const TOOL_TURNING_BORING: number;
declare const TOOL_TURNING_CUSTOM: number;
declare const TOOL_PROBE: number;
declare const TOOL_WIRE: number;
declare const TOOL_WATER_JET: number;
declare const TOOL_LASER_CUTTER: number;
declare const TOOL_PLASMA_CUTTER: number;
declare const TOOL_WELDER: number;
declare const TOOL_GRINDER: number;
declare const TOOL_MARKER: number;

// ===========================================================================
//  TOOL COMPENSATION CONSTANTS
// ===========================================================================

declare const TOOL_COMPENSATION_INSERT_CENTER: number;
declare const TOOL_COMPENSATION_TIP: number;
declare const TOOL_COMPENSATION_TIP_CENTER: number;
declare const TOOL_COMPENSATION_TIP_TANGENT: number;

// ===========================================================================
//  MOVEMENT CONSTANTS
// ===========================================================================

/** Rapid movement. */
declare const MOVEMENT_RAPID: number;
/** Lead-in movement. */
declare const MOVEMENT_LEAD_IN: number;
/** Cutting movement. */
declare const MOVEMENT_CUTTING: number;
/** Lead-out movement. */
declare const MOVEMENT_LEAD_OUT: number;
/** Transition linking movement. */
declare const MOVEMENT_LINK_TRANSITION: number;
/** Direct linking movement. */
declare const MOVEMENT_LINK_DIRECT: number;
/** Helical ramp. */
declare const MOVEMENT_RAMP_HELIX: number;
/** Profile ramp. */
declare const MOVEMENT_RAMP_PROFILE: number;
/** Zig-zag ramp. */
declare const MOVEMENT_RAMP_ZIG_ZAG: number;
/** General ramp. */
declare const MOVEMENT_RAMP: number;
/** Plunge movement. */
declare const MOVEMENT_PLUNGE: number;
/** Predrill movement. */
declare const MOVEMENT_PREDRILL: number;
/** Extended movement. */
declare const MOVEMENT_EXTENDED: number;
/** Reduced cutting feed. */
declare const MOVEMENT_REDUCED: number;
/** Finish cutting. */
declare const MOVEMENT_FINISH_CUTTING: number;
/** High-feed movement. */
declare const MOVEMENT_HIGH_FEED: number;
/** Depositing (additive). */
declare const MOVEMENT_DEPOSITING: number;
/** Bridging (additive). */
declare const MOVEMENT_BRIDGING: number;
/** Connection between toolpaths. */
declare const MOVEMENT_CONNECTION: number;
/** Drill breakthrough. */
declare const MOVEMENT_DRILL_BREAKTHROUGH: number;
/** Gun drill positioning. */
declare const MOVEMENT_GUN_DRILL_POSITIONING: number;
/** Circular pierce (jet). */
declare const MOVEMENT_PIERCE_CIRCULAR: number;
/** Profile pierce (jet). */
declare const MOVEMENT_PIERCE_PROFILE: number;
/** Linear pierce (jet). */
declare const MOVEMENT_PIERCE_LINEAR: number;
/** Plunge pierce (jet). */
declare const MOVEMENT_PIERCE: number;

// ===========================================================================
//  COMMAND CONSTANTS (for onCommand)
// ===========================================================================

declare const COMMAND_STOP: number;
declare const COMMAND_OPTIONAL_STOP: number;
declare const COMMAND_END: number;
declare const COMMAND_SPINDLE_CLOCKWISE: number;
declare const COMMAND_SPINDLE_COUNTERCLOCKWISE: number;
declare const COMMAND_START_SPINDLE: number;
declare const COMMAND_STOP_SPINDLE: number;
declare const COMMAND_ORIENTATE_SPINDLE: number;
declare const COMMAND_LOAD_TOOL: number;
declare const COMMAND_COOLANT_ON: number;
declare const COMMAND_COOLANT_OFF: number;
declare const COMMAND_ACTIVATE_SPEED_FEED_SYNCHRONIZATION: number;
declare const COMMAND_DEACTIVATE_SPEED_FEED_SYNCHRONIZATION: number;
declare const COMMAND_LOCK_MULTI_AXIS: number;
declare const COMMAND_UNLOCK_MULTI_AXIS: number;
declare const COMMAND_EXACT_STOP: number;
declare const COMMAND_START_CHIP_TRANSPORT: number;
declare const COMMAND_STOP_CHIP_TRANSPORT: number;
declare const COMMAND_OPEN_DOOR: number;
declare const COMMAND_CLOSE_DOOR: number;
declare const COMMAND_BREAK_CONTROL: number;
declare const COMMAND_TOOL_MEASURE: number;
declare const COMMAND_CALIBRATE: number;
declare const COMMAND_VERIFY: number;
declare const COMMAND_CLEAN: number;
declare const COMMAND_ALARM: number;
declare const COMMAND_ALERT: number;
declare const COMMAND_CHANGE_PALLET: number;
declare const COMMAND_POWER_ON: number;
declare const COMMAND_POWER_OFF: number;
declare const COMMAND_MAIN_CHUCK_OPEN: number;
declare const COMMAND_MAIN_CHUCK_CLOSE: number;
declare const COMMAND_SECONDARY_CHUCK_OPEN: number;
declare const COMMAND_SECONDARY_CHUCK_CLOSE: number;
declare const COMMAND_SECONDARY_SPINDLE_SYNCHRONIZATION_ACTIVATE: number;
declare const COMMAND_SECONDARY_SPINDLE_SYNCHRONIZATION_DEACTIVATE: number;
declare const COMMAND_SYNC_CHANNELS: number;
declare const COMMAND_PROBE_ON: number;
declare const COMMAND_PROBE_OFF: number;

// ===========================================================================
//  HIGH FEED MAPPING CONSTANTS
// ===========================================================================

/** Do not map rapids to high feed. */
declare const HIGH_FEED_NO_MAPPING: number;
/** Map multi-axis rapids to high feed. */
declare const HIGH_FEED_MAP_MULTI: number;
/** Map rapids along XY or Z to high feed. */
declare const HIGH_FEED_MAP_XY_Z: number;
/** Map all rapids to high feed. */
declare const HIGH_FEED_MAP_ANY: number;

// ===========================================================================
//  SECTION TYPE CONSTANTS
// ===========================================================================

declare const TYPE_MILLING: number;
declare const TYPE_TURNING: number;
declare const TYPE_JET: number;

// ===========================================================================
//  OPTIMIZE CONSTANTS
// ===========================================================================

declare const OPTIMIZE_NONE: number;
declare const OPTIMIZE_TABLES: number;
declare const OPTIMIZE_BOTH: number;
declare const OPTIMIZE_AXIS: number;

// ===========================================================================
//  SINGULARITY LINEARIZE CONSTANTS
// ===========================================================================

declare const SINGULARITY_LINEARIZE_OFF: number;
declare const SINGULARITY_LINEARIZE_LINEAR: number;
declare const SINGULARITY_LINEARIZE_ROTARY: number;

// ===========================================================================
//  STRATEGY GROUP CONSTANTS
// ===========================================================================

declare const STRATEGY_MULTIAXIS: number;
declare const STRATEGY_2D: number;
declare const STRATEGY_3D: number;
declare const STRATEGY_DRILLING: number;
declare const STRATEGY_TURNING: number;
declare const STRATEGY_JET: number;
declare const STRATEGY_PROBING: number;
declare const STRATEGY_INSPECTION: number;
declare const STRATEGY_ADDITIVE: number;

// ===========================================================================
//  FEED MODE CONSTANTS
// ===========================================================================

declare const FEED_PER_MINUTE: number;
declare const FEED_PER_REVOLUTION: number;
declare const FEED_INVERSE_TIME: number;

// ===========================================================================
//  CONTENT FLAG CONSTANTS
// ===========================================================================

declare const HAS_PARAMETER: number;
declare const HAS_RAPID: number;
declare const HAS_LINEAR: number;
declare const HAS_DWELL: number;
declare const HAS_CIRCULAR: number;
declare const HAS_CYCLE: number;
declare const HAS_WELL_KNOWN_COMMAND: number;
declare const HAS_COMMENT: number;

// ===========================================================================
//  RECORD TYPE CONSTANTS
// ===========================================================================

declare const RECORD_INVALID: number;
declare const RECORD_WELL_KNOWN_COMMAND: number;
declare const RECORD_MACHINE_COMMAND: number;
declare const RECORD_SPINDLE_SPEED: number;
declare const RECORD_PARAMETER: number;
declare const RECORD_LINEAR: number;
declare const RECORD_LINEAR_5D: number;
declare const RECORD_LINEAR_ZXN: number;
declare const RECORD_LINEAR_EXTRUDE: number;
declare const RECORD_CIRCULAR: number;
declare const RECORD_DWELL: number;
declare const RECORD_CYCLE: number;
declare const RECORD_CYCLE_OFF: number;
declare const RECORD_COMMENT: number;
declare const RECORD_WIDE_COMMENT: number;
declare const RECORD_PASS_THROUGH: number;
declare const RECORD_WIDE_PASS_THROUGH: number;
declare const RECORD_OPERATION: number;
declare const RECORD_OPERATION_END: number;
declare const RECORD_CIRCULAR_EXTRUDE: number;

// ===========================================================================
//  ASCII CONTROL CODES & SPECIAL STRINGS
// ===========================================================================

declare const EOL: string;
declare const SP: string;
declare const PATH_SEPARATOR: string;
declare const NUL: string;
declare const SOH: string;
declare const STX: string;
declare const ETX: string;
declare const EOT: string;
declare const CR: string;
declare const LF: string;
declare const TAB: string;

// ===========================================================================
//  GLOBAL FUNCTIONS
// ===========================================================================

// ---- Output Functions ----

/** Writes the specified text to the NC output file excluding an end-of-line marker.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a32071fff63a93a3494979e835aaacc9a */
declare function write(message: string): void;

/** Writes the specified text to the NC output file including an end-of-line marker.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aeb90bf455982d43746741f6dce58279c */
declare function writeln(message: string): void;

/** Writes the specified words to the NC output file including an end-of-line marker using the word separator (see getWordSeparator() and setWordSeparator()). Empty strings or undefined values are ignored. No line is output for completely empty lines.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a2e458cd4cdf20806ac7afaf13232a779 */
declare function writeWords(...words: string[]): void;

/** This method is similar to writeWords() with the exception that text is only output if the 2 argument or above results in text. This function is useful when outputting block numbers to avoid output.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a26a51e1eef93cfd3f7dcf66da436583b */
declare function writeWords2(...words: string[]): void;

/** Returns the string output by writeWords() without end-of-line.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a891175b41f166fce83100d6cbd6d4504 */
declare function formatWords(...words: string[]): string;

/** Returns the separator for word-based the line output.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ada0c57582300da66213635ccc64c8e7f */
declare function getWordSeparator(): string;

/** Sets the separator for word-based line output. Defaults to a space (i.e. " ").
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aea95987c6248d8d46db8e7481609fe4d */
declare function setWordSeparator(separator: string): void;

/** Writes the notes for the current section as comments.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ad3fe4cd43679cb02596baa1d72c4e0e5 */
declare function writeSectionNotes(): void;

/** Writes an error message and aborts the script.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a41de7e97313422e0fa1ff6265901b0e8 */
declare function error(message: string): void;

/** Writes a warning.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a142480b11a33b89259a93b16d67b35b9 */
declare function warning(message: string): void;

/** Writes the specified warning if the given warning id has not been used before.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a7c84675981a0f7e9672c2653298b344d */
declare function warningOnce(message: string, id: number): void;

/** Writes the specified message to the log.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a5d7d1f99129bbc3846054e8d5b70cb48 */
declare function log(message: string): void;

/** Raises an exception if the expression is false. Use this function to make sure that you have protected your code against invalid cases.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a37d7c88322479cc4b8775219c7104161 */
declare function validate(expression: any, message: string): void;

// ---- Unit / Conversion Functions ----

/** Returns the specified spatial value and unit in the internal unit. Note: IN values are scaled with 25 relative to MM.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a237487f4656f95641ef1d26ca62b7b01 */
declare function spatial(value: number, unit: number): number;

/** Returns the specified value in the output unit. Note: The unit conversion scale used is 25mm to 1in and not 25.4.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a7de682c8593fcacc60e146467563e52d */
declare function toUnit(value: number, unit: number): number;

/** Returns the specified value in the output unit. Note: The unit conversion scale used is 25.4.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a2f33c593779c135e774347331310dd14 */
declare function toPreciseUnit(value: number, unit: number): number;

/** Returns the specified angle in degrees.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a27965dc305215f673efcea4330d2431a */
declare function toDeg(radians: number): number;

/** Returns the specified angle in radians.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a40562fe347c39025af57410c92c2c373 */
declare function toRad(degrees: number): number;

/** Returns the number of sections.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a057dfc309ce401ba7b500c9f02932400 */
declare function getNumberOfSections(): number;

/** Returns the specified section. The index must be in the range [0; getNumberOfSections()].
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af315a19e0323fb203e0722c78cd8489e */
declare function getSection(index: number): Section;

/** Returns the previous section. Must be called within a section.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a37f8e29d0e0d1dc7a72686213017291d */
declare function getPreviousSection(): Section;

/** Returns the next section.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a45b53bd6d47a8cb66a4f7b9c48d3b612 */
declare function getNextSection(): Section;

/** Returns true if the current section is the last section.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a88727127d8244592c3fa9b2e038824d6 */
declare function isLastSection(): boolean;

/** Returns true for turning toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a628370dfe60afca3c10d0bc35add6b4f */
declare function isTurning(): boolean;

/** Returns true if the program is a 3D program (i.e. the tool axis points along the Z-axis for all the sections).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aeb49e46594378647705034b03affee0a */
declare function is3D(): boolean;

/** Returns the current position.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a067bc8148cdc35daadb8afb07ec3f63a */
declare function getCurrentPosition(): Vector;

/** Sets the current position.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a4f55914630113a4e4d015f425385156a */
declare function setCurrentPosition(position: Vector): void;

/** Returns the specified section position in the current frame specified using setRotation() and setTranslation().
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a16fc4a2c23c1cc1514ff7c58a4c9bce0 */
declare function getFramePosition(position: Vector): Vector;

/** Returns the specified section direction in the current frame specified using setRotation().
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a5f40fc8085854d4890cc4c9c685c58cc */
declare function getFrameDirection(direction: Vector): Vector;

/** Returns the specified position in the current section in the WCS. You likely want to use getGlobalPosition() instead.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ad766e32a70e707566cbc6c2f434223cd */
declare function getWCSPosition(p: Vector): Vector;

/** Returns the tool axis if the section is not optimized for the machine. Returns the rotary angles if the section is optimnized for the machine.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a1430d74a67b17577acf940ab77773585 */
declare function getCurrentDirection(): Vector;

/** Returns the current ABC position.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aceaece44998483b92f9ea5be52f7aa13 */
declare function getCurrentABC(): Vector;

/** Returns the current tool axis.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9e70702d4117aed3ccfaffd12ab5738e */
declare function getCurrentToolAxis(): Vector;

/** Sets the rotation. This is normally used for rotating around the tool axis.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a41162be7196b5b671c195807c9bbb7fc */
declare function setRotation(rotation: Matrix): void;

/** Sets the translation.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3d7f8b45d5022e52d44b05540674c17c */
declare function setTranslation(translation: Vector): void;

/** Cancels any active output frame transformation defined by setRotation() and setTranslation().
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ae7825cd471b7b6882817540ffbc73644 */
declare function cancelTransformation(): void;

/** Returns the current translation.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3d002f4077b45f2d82c61c6f6396ba13 */
declare function getTranslation(): Vector;

// ---- Machine Configuration Functions ----

/** Returns the active machine configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a50d1979cdb845a2b7c34301136930623 */
declare function getMachineConfiguration(): MachineConfiguration;

/** Sets the active machine configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ad38400d98dcd5a7ac881ba38ee096187 */
declare function setMachineConfiguration(machine: MachineConfiguration): void;

/** Constructs a new machine axis. The supported specifiers are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8803b36be6893a81991049766abe0794 */
declare function createAxis(specifiers: object): Axis;

/** Optimizes the machine angles for 5-axis motion using the active machine configuration. The directions for onRapid5D() and onLinear5D() are hereafter mapped to machine angles from the initial direction vector. The work plane and origin are mapped into the WCS plane and origin.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ab044d9c3d63e55f60c3a0d430287b75b */
declare function optimizeMachineAngles2(optimizeType: number): void;

/** Returns an object containing length information about the current multiaxis move.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af058edfd50a0b8e35fc3094c3644bdfe */
declare function getMultiAxisMoveLength(x: number, y: number, z: number, a: number, b: number, c: number): MoveLength;

// ---- Format / Variable Creation Functions ----

/** Constructs the format specification for the given values. The supported specifiers are: The following specifiers are deprecated since r45892. You cannot mix the new specifiers with the deprecated specifiers in a single command.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a0595eae6f27f88872305a126a5db119b */
declare function createFormat(specifiers: object): FormatNumber;

/** Creates a new OutputVariable instance. The supported specifiers are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8058a96192a419464ec439ad745a3f97 */
declare function createOutputVariable(specifiers: object, format: FormatNumber): OutputVariable;

/** Creates a new Variable instance. DEPRECATED, use createOutputVariable. The supported specifiers are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aacf9c27543d7dbec4d66d7e37a259ad3 */
declare function createVariable(specifiers: object, format: FormatNumber): Variable;

/** Creates a new ReferenceVariable instance. DEPRECATED, use createOutputVariable. The supported specifiers are: The supported specifiers are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ae514eb97bff185e62ed1a65d26650087 */
declare function createReferenceVariable(specifiers: object, format: FormatNumber): ReferenceVariable;

/** Creates a new Modal instance. DEPRECATED, use createOutputVariable. The supported specifiers are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a171d6ddae8c04c1ad624561972ad86fd */
declare function createModal(specifiers: object, format: FormatNumber): Modal;

/** May be invoked in cycle mode to expand a well-known cycle. Used when a specific cycle is not supported by a control.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#adcaaa09d41e9c6b4434cbc54fa5260e1 */
declare function expandCyclePoint(x: number, y: number, z: number): void;

/** Returns an error message if the current cycle is not supported.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a6d8623fab197e7d15ea1c71d9d283869 */
declare function cycleNotSupported(): void;

/** Returns true if the current cycle point is the last motion for the current cycle. Returns false if cycle is not active.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af571e355eb4565d09ba992b6950327a4 */
declare function isLastCyclePoint(): boolean;

/** Returns the number of cycle points for the current cycle.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a4b3cdd32aafe3c3c798bb082c6867bbe */
declare function getNumberOfCyclePoints(): number;

/** Returns true if the given cycle is a probing cycle.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a87de040424e7745da9c117d10cb85274 */
declare function isProbingCycle(uri: string): boolean;

/** Returns true if the current cycle is a well-known cycle.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#acac36f67f92aa367fab39903934d6ee8 */
declare function isWellKnownCycle(): boolean;

// ---- Tool Functions ----

/** Returns the first tool.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#adadd5d3ac553a53aeb010a4f0347622f */
declare function getFirstTool(): Tool;

/** Returns an array of tools used in the program deemed different based on the 'arguments' and 'flag' criteria. Returns an array of {tool, operations, range} objects. 'tool' is the Tool object, 'operations' is a list of operation ID's that the tool is used in, and 'range' contains the minimum and maximum Z-values for a 3D operation, it will be 'undefined' if the tool is used in a 3+2 or multi-axis operation.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a52c939232474c2c445ce2a31c3d3ca09 */
declare function getToolList(arguments_: string, flag: number): Tool[];

/** Returns whether a tool change is needed, based on the given criteria as arguments. If "description" is provided as an argument, then the tool description must be defined or an error will be generated. Returns whether a tool change is needed
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ab401f18d3ec0987c6fc0f86a9103baa2 */
declare function isToolChangeNeeded(section: Section, arguments_?: string): boolean;

/** Returns true if the specified parameter has been defined globally.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a7195e2b716f4f40604e0697e3df6634e */
declare function hasGlobalParameter(name: string): boolean;

/** Returns true if the specified parameter has been defined. Only parameters before the current record will be checked.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af023fd31344206b149bafc7650e0c940 */
declare function hasParameter(name: string): boolean;

/** Returns the value of the specified post property. If the specified property doesn't exist, it returns the default value if specified, otherwise it returns undefined. You can retrieve an operation property of a specific section by using the 'section.getProperty()' function. It takes the same arguments as getProperty(). Since r45811. e.g.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8f6be90781835876e83f3f9c3a2a9f2e */
declare function getProperty(property: any, defaultValue?: any): any;

/** Validates the property definitions.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a839f5acba612e862aae67a7f3c1b9a2b */
declare function validatePropertyDefinitions(): boolean;

/** Returns whether a new work plane is needed for the given section.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af94e1ac219746838218be332fb272bf8 */
declare function isNewWorkPlane(section: Section): boolean;

/** Returns whether a new work offset is used for the given section.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aad87d4f314d638033ac911776ad92675 */
declare function isNewWorkOffset(section: Section): boolean;

// ---- Circular Motion Query Functions (available during onCircular) ----

/** Returns the distance from the circular start point to the circular center for the current circular motion. Returns an unspecified value if the current motion is not circular.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3bade4829be3d8fa885e645bb3044835 */
declare function getCircularOffset(): Vector;
/** Returns the end radius for the current circular motion. Returns an unspecified value if the current motion is not circular.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a155d9fb287c5f2bd7435b428b99bbd42 */
declare function getCircularRadius(): number;
/** Returns the chord length for the current circular motion. Returns an unspecified value if the current motion is not circular. Returns 0 for full circular motion.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a92b44ddbab2d4d93aaeac12e31b77745 */
declare function getCircularChordLength(): number;
/** Returns true if the current circular motion is clockwise. Returns an unspecified value if the current motion is not circular.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a14747147268151dbc30cd3e56fd3a004 */
declare function isClockwise(): boolean;
/** Returns true if the current circular motion is helical. Returns an unspecified value if the current motion is not circular.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a01a9ca5a770fd8305ef906f060f22ba4 */
declare function isHelical(): boolean;
/** The CCW-normal of the circular plane. However, the normal is flipped if isClockwise() is true. This behavior ensures direct compatibility with RS274 for the right hand G17, G18, and G19 plane convention.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a265723cd031146ee8488701cd1d9a3e2 */
declare function getCircularNormal(): Vector;
/** Returns the helical offset of the current circular motion. Returns (0, 0, 0) for non-helical motion. Returns an unspecified value if the current motion is not circular.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aec4b48eb694068006417b64a350e4810 */
declare function getHelicalOffset(): Vector;
/** Returns the helical pitch of the current circular motion. Returns 0 for non-helical motion. Returns an unspecified value if the current motion is not circular.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a6064301b2facee8e6cf98d8cef99d599 */
declare function getHelicalPitch(): number;
/** Linearizes the current motion to the specified tolerance. Use canLinearize() to determine if the current record can be linearized. The start position is not output.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aac3c83981c8dc36ab49c0fabdd2ff797 */
declare function linearize(tolerance: number): void;
/** Returns the position at the specified u coordinate for the current motion. The u coordinate is clamped to the range [0; 1].
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a62c9464783461827866ce0484f79875b */
declare function getPositionU(u: number): Vector;
/** Returns the length of the current motion.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ab7d7f0c43fd26b5a4239a308cf30472b */
declare function getLength(): number;
/** Returns the current movement type.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ae3abe6300395639591b45c33b5381138 */
declare function getMovement(): number;
/** Returns the current spindle speed.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#acf81b549de1d1898a48e1802d2d5a819 */
declare function getSpindleSpeed(): number;
/** Returns true if the output is being redirected.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a0a6388b6aaf271b71c67bef0f1de654f */
declare function isRedirecting(): boolean;
/** Redirects the output to the global buffer. Use getRedirectionBuffer() to access the current buffer content. Use getRedirectionBuffer2() to clear the buffer during redirection. Close redirection again using closeRedirection().
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aa340ed7126b7659daafb1f475231b314 */
declare function redirectToBuffer(): void;
/** Returns the current content of the redirection buffer.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a219c1ac74b576fb85a9af1438e97d04a */
declare function getRedirectionBuffer2(clear: boolean): string;
/** Returns the path on the intermediate file.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9ad7f064508d465d310ee4b1d6207499 */
declare function getIntermediatePath(): string;
/** Returns the path on the configuration folder.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#abb5ce62e5dd0f757a5c316068bd936e5 */
declare function getConfigurationFolder(): string;
/** Returns the folder path on the running post processor.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a6cc63a50acc839e5152a0473ca4766db */
declare function getPostProcessorFolder(): string;
/** Includes the specified post processing script.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a92ca78e202ec522d37d4773ec3a37541 */
declare function include(path: string): void;
/** Returns the localized text for the specified native text if the result is supported in the active code page/encoding. Otherwise the original text is returned.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a336174d3ff096f7bcb809c6fb3893e23 */
declare function localize(message: string): string;

/** Returns the language id.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9584192e467c9bc0b08bcf8d70436a95 */
declare function getLangId(): string;

/** Returns the current output code page id.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a7d5e6896041e74f6785b1f25189d7b74 */
declare function getCodePage(): number;

/** Returns the specified value if the condition is true and otherwise the empty string.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a40f235f2a37336416b69e72f53d04fa2 */
declare function conditional(condition: any, value: string): string;

/** Returns a new string with all characters not present in keep removed.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ab924009686e0b4fa1b363a946c21b648 */
declare function filterText(text: string, keep: string): string;

/** Returns a new string with the named substrings of the first argument substituted by the specified arguments. This method supports up to 16 arguments.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af80b7272cd5dd0f7f99a1a236247a638 */
declare function subst(message: string, ...args: any[]): string;

/** Converts the specified text to a float. Raises an exception if all the specified text cannot be converted.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8cbd3635d767a591d11206722ac593f9 */
declare function getAsFloat(text: string): number;

/** Returns the output unit.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aca73af21b3d2186fc803fe680f1d6f38 */
declare function getOutputUnit(): number;
/** Returns the dog-leg flag. The default is false.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3471aa215809eeb7d857e2db6a099eeb */
declare function getDogLeg(): boolean;
/** Sets the EOL style. Windows EOL style CRLF is the default.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#afc3adcad7debce557de1aefe9c491d81 */
declare function setEOL(eol: string): void;
/** Tells the post processor to skip the remaining of the current section. onSectionEnd() will still be invoked.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3fa7cf1713aa6d66f84ac3e6fea769a3 */
declare function skipRemainingSection(): void;
/** Returns the inverse time (F).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#accfe735dd76556e25b597ee506b4d414 */
declare function getInverseTime(distance: number, speed: number): number;
/** Returns the standard G-code plane number (17, 18, or 19). PLANE_XY: 17 PLANE_ZX: 18 PLANE_YZ: 19 Returns 0 for all other planes.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ac04586b1089c5c2f30e4e56bb187ba2a */
declare function getISOPlane(plane: number): number;
/** Returns the quadrant for the specified angle (0 -> 3).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3dff57fe1bff7929f791c78f072d8a5c */
declare function getQuadrant(angle: number): number;
/** Returns the fixture bounding box.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a0e75c92b9d1e3fa1155c1bf2fa29e56d */
declare function getFixture(): BoundingBox;
/** Get the program name as an Integer if it is within the [min, max] range, or error otherwise.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3ae713848a4348b6a1366d12b1b1c886 */
declare function getProgramNameAsInt(min: number, max: number): number;
/** Returns the Z range for the currently active tool, for the current and upcoming consecutive sections that use this tool. Returns undefined if the tool does not have a Z axis (e.g. on 2D operations). Returns the Range for the tool's Z axis.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a250bca3a3a1a32ad8798b8d172e5ccc7 */
declare function toolZRange(): Range;
/** Returns the platform identifier. E.g. "WIN32" for Windows and "OSX" for Mac OS X.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#adf1be112d5f70697ded4b3e5465d37f2 */
declare function getPlatform(): string;
/** Returns the version of the software component.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a12b5671e8920e8ce5c4457ea8d0d9fb2 */
declare function getVersion(): string;
/** Returns the specified material as a string.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a6642268d6ed91ea9b516820913f247f4 */
declare function getMaterialName(material: number): string;
/** Returns true if the specified command is well-known.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3e865d9162a02f0e92e349fbadbd5e0c */
declare function isWellKnownCommand(command: number): boolean;
/** Writes an error message for the specified command.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8a05d18dfacdbd16cadf68bb4346e0aa */
declare function onUnsupportedCommand(command: number): void;
/** Registers a termination handler to be called after onTerminate(). The termination handlers are called in the opposite order of registration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a927541aef6a94ce44f99b01f3727ee72 */
declare function registerTerminationHandler(fn: Function): void;
/** Loads the specified machine configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a44e37f1703ec1a53346741ed2524d480 */
declare function loadMachineConfiguration(path: string): MachineConfiguration;
/** Returns the security level in which is post processor is running.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ad2e9135827033f0de36ccf48557cf04a */
declare function getSecurityLevel(): number;
/** Returns the specified record.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a0a2b6f4236b1d7ffa123d6a49a149791 */
declare function getRecord(id: number): Record;
/** Returns true if the current motion is a result of an expanded motion. Expanded motion is for instance produced by expandCyclePoint().
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a02a2028fad06308dcd85b70cb04d4a52 */
declare function isExpanding(): boolean;
/** Returns whether the current section is an inspection operation Returns true if section is an inspection operation, otherwise returns false
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a642a1927f57fb8cc76caf97e8d57ff51 */
declare function isInspectionOperation(section: Section): boolean;
/** Returns whether the current section is a drilling operation Returns true if section is a drilling operation, otherwise returns false
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a7216eb38f0a20d1b80f7a6997d72b812 */
declare function isDrillingCycle(section: Section, checkBoringCycles?: boolean): boolean;
/** Returns whether the current section is an axial center drilling operation Returns true if section is an axial center drilling operation, otherwise returns false
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a41f9c0e32ddbad2431dc5ef8a1afaf05 */
declare function isAxialCenterDrilling(section: Section, checkLiveTool?: boolean): boolean;
/** Returns an array with values in the requested range. range(end) range(first, end) range(first, end, step)
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#afad3cc545e7389e65984f259550d7f77 */
declare function range(first: number, end: number, step?: number): number[];
/** Flattens the specified array.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3c74249c9ab6fe2ab2a8638a116b146a */
declare function flatten(array: any[]): any[];

// ---- Invoke Functions (re-dispatch motion) ----

/** Called to invoke onLinear in the post engine. Returns true on success.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#abe2741ffa77244c8bd6ac1391cfae611 */
declare function invokeOnLinear(x: number, y: number, z: number, feedrate: number): boolean;
/** Called to invoke onLinear5D in the post engine. Returns true on success.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#abaf22029e26d5f51421fe4166506a1c6 */
declare function invokeOnLinear5D(x: number, y: number, z: number, dx: number, dy: number, dz: number, feedrate: number): boolean;
/** Called to invoke onSpindleSpeed in the post engine. Returns true on success.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aa3ca0ba6f36a8b5919a573d00d2a7f23 */
declare function invokeOnSpindleSpeed(spindleSpeed: number): boolean;
/** Call to activate and setup Polar Mode. Returns the polar transformed initial position and direction as a pair of vectors. var x_axis = new Vector (1, 0, 0); var posDir = activatePolarMode (0.01, cOutput.getCurrent(), x_axis); var x = posDir. first . x ; var y = posDir.first.y; var z = posDir.first.z; var a = posDir.second.x; var b = posDir.second.y; var c = posDir.second.z;
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ae1f3a4050caf79e540af1d476f30b36c */
declare function activatePolarMode(tolerance: number, currentAngle: number, polarDirection: Vector, interpolateRapidMoves: boolean, optimizeType: number): VectorPair;
/** Call to check if Polar Mode is active. Returns true if activatePolarMode() has been called.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a477da21ffbfa7f66d5b22e49cfc057da */
declare function isPolarModeActive(): boolean;
/** Activates automatic polar mode handling. The supported options are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a1b625e72dad004c2a77eb9279089c7e2 */
declare function activateAutoPolarMode(options: object): void;

// ---- Expanded motion callbacks (called by expandCyclePoint) ----

/** onExpandedLinear() calls the onLinear() entry function and lets the post processor know that the current position has changed at the same time. You should generally not call onLinear() directly.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aaa669c442e5def9ccc580358f48526e3 */
declare function onExpandedLinear(x: number, y: number, z: number, feed: number): void;
/** Returns true if the section has a previous record.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ae1e59cc8cd9f9354b478b8af6b472331 */
declare function hasPreviousRecord(): boolean;
/** Returns true if the section has a next record.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ab61a4e3f43cedde851db7f3237e4b91c */
declare function hasNextRecord(): boolean;
/** Invoked during post processing when the machine configuration changes.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a6c28394831f15db91439641be42789aa */
declare function onMachine(): void;

/** Invoked during initialization before the first section.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a65df793600ddb8e3b4dbece18d24438d */
declare function onOpen(): void;

/** Pass-through entry function.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ac85eb260176dc186767f8e93c650c0c8 */
declare function onPassThrough(value: any): void;

/** Called for each comment. */
declare function onComment(comment: string): void;

/** Called at the start of each section (operation). */
declare function onSection(): void;

/** Entry function invoked for dwelling.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a63f5afc08861039dd5c28fa82f5ef59e */
declare function onDwell(seconds: number): void;

/** Entry function invoked for linear motion at rapid traverse.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ad8921f5ec26f581064354f9feb4f928c */
declare function onRapid(x: number, y: number, z: number): void;

/** Entry function for circular motion.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a69cdac7a0532f704ede16ce81511ee30 */
declare function onCircular(clockwise: boolean, cx: number, cy: number, cz: number, x: number, y: number, z: number, feedrate: number): void;

/** Entry function invoked for linear 5-axis motion at feed. The tool axis may also be returned in machine angles depending on the mode in accordance with the active machine configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a44c2cdde97b41e1ab81bd836ee859aa2 */
declare function onLinear5D(x: number, y: number, z: number, dx: number, dy: number, dz: number, feedrate: number): void;

/** Entry function invoked for 5-axis motion when machine axis rewind is required. This is called before performing a machine rewind in the kernel, as onRewindMachine() is now deprecated. Returns True if we don't want the kernel to perform the machine rewind, False otherwise.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a071236cc3d3d72695f0f11bd1e2e723d */
declare function onRewindMachineEntry(a: number, b: number, c: number): void;

/** Entry function invoked during a machine rewind procedure. It needs to output the code for returning from safe position after indexing rotaries.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9e63cd78348e19028e0203569a90bb6c */
declare function onReturnFromSafeRetractPosition(x: number, y: number, z: number): void;

/** Entry function invoked when the movement type changes.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a5bb516854f5f66d7a4e084c3a45e7a13 */
declare function onMovement(movement: number): void;

/** Entry function invoked when the radius compensation mode changes.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ab82fdefb6ee23686a3c945dcb7147718 */
declare function onRadiusCompensation(): void;

/** Entry function invoked when the tool compensation changes. Only used for specific tool types for which dual compensation is defined.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af4166ab645097eaea7f43c76f4d7ae80 */
declare function onToolCompensation(compensation: number): void;

/** onCyclePoint() is the entry function for cycle positions. The function expands all well-known cycles by default. The specified position is the center of the hole for drilling or equivalent cycles. You should always use cycle.bottom as the bottom coordinate if defined.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a4e1cf241ab139ce858a305e36dfffb93 */
declare function onCyclePoint(x: number, y: number, z: number): void;

/** The onCyclePathEnd() entry function is invoked at the ending of cycle toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a0ee125703ef4618fd8bc76e57a66c5d7 */
declare function onCyclePathEnd(): void;

/** Entry function invoked for well-known commands. The known commands are:
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af3a71236d7fe350fd33bdc14b0c7a4c6 */
declare function onCommand(command: number): void;

/** Called for Manual NC commands. */
declare function onManualNC(command: number, value: string): void;

/** Called for machine commands. */
declare function onMachineCommand(command: number): void;

/** Called when spindle orientation is required. */
declare function onOrientateSpindle(angle: number): void;

/** Called after the last posted operation of a Part Alignment. */
declare function onLiveAlignment(): void;

/** Entry function invoked for circular extrusion motion at feed.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aba9be73978debf179c90eba8a1a0cb96 */
declare function onCircularExtrude(clockwise: boolean, cx: number, cy: number, cz: number, x: number, y: number, z: number, feedrate: number, extrusionLength: number): void;

/** Entry function invoked at the end of a layer in a DED toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a927e748ba62cc2904121381791ed14c4 */
declare function onLayerEnd(layerNumber: number): void;

/** Entry function invoked when the extruder is changed in an additive FFF toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a6bc70ee5e27a6df284a81caef1b12aeb */
declare function onExtruderChange(extruderId: number): void;

/** Entry function invoked when the bed temperature is changed in an additive FFF toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a03ae658a31598983f59dd743f10d7bb4 */
declare function onBedTemp(temp: number, wait: boolean): void;

/** Entry function invoked when the max axis acceleration is changed in an additive FFF toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a79a06a70f46244b796c7c0061d27b54d */
declare function onMaxAcceleration(xAxis: number, yAxis: number, zAxis: number, eAxis: number): void;

/** Entry function invoked when the axis jerk is changed in an additive FFF toolpath.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#afd0052ff663b0c7572683014d12e9f60 */
declare function onJerk(xAxis: number, yAxis: number, zAxis: number, eAxis: number): void;

/** Called at the end of each section (operation). */
declare function onSectionEnd(): void;

/** Called at the end of special cycle sections. */
declare function onSectionEndSpecialCycle(): void;

/** Called at post processing completion. Output the program footer here. */
declare function onClose(): void;

/** Called after post processing has completed. The output file is unlocked. */
declare function onTerminate(): void;
