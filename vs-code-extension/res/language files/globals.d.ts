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

/** A short description of the post processor shown in the post library.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a76d2b0133d83c43dfd8a19286ac55325 */
declare var description: string;

/** A longer description of the post processor. */
declare var longDescription: string;

/** The vendor name (e.g. "Fanuc", "Heidenhain"). */
declare var vendor: string;

/** The vendor URL. */
declare var vendorUrl: string;

/** The legal/copyright text. */
declare var legal: string;

/** The certification level (0-2). */
declare var certificationLevel: number;

/** The minimum post engine revision required. */
declare var minimumRevision: number;

/** The NC file extension (e.g. "nc", "gcode", "h"). */
declare var extension: string;

/** The file name for the output (without extension). */
declare var filename: string;

/** The post processor version string. */
declare var version: string;

/** Capability flags. Combine with bitwise OR: CAPABILITY_MILLING | CAPABILITY_TURNING.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a201e06654b2b8875b11c419093b607b2 */
declare var capabilities: number;

/** The linearization tolerance in output units. Use `spatial()` to set unit-aware values.
 * @example
 * tolerance = spatial(0.002, MM);
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a40f244d9f6d9ededaacd92c57c78a318 */
declare var tolerance: number;

/** The minimum chord length for circular output. Use `spatial()`.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a391ac41ffa378246cc556ff9a481c7ef */
declare var minimumChordLength: number;

/** The minimum allowed circular radius. Use `spatial()`.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ac26721edd5466a7953a79f04f50461ac */
declare var minimumCircularRadius: number;

/** The maximum allowed circular radius. Use `spatial()`.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ace7d1f00e4410e1f4baf57b8c29c8c02 */
declare var maximumCircularRadius: number;

/** The minimum circular sweep angle in radians. Use `toRad()`.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8b0a3da10984e4aa76b26dfa25a757a1 */
declare var minimumCircularSweep: number;

/** The maximum circular sweep angle in radians. Use `toRad()`.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ac3cde96c729ef76f069a1a2ebfcf5d0d */
declare var maximumCircularSweep: number;

/** Set to `true` to allow helical moves.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#adea8014cc3c4028a10b12ca27a224698 */
declare var allowHelicalMoves: boolean;

/** Set to `true` to allow spiral moves.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9d4c62f202e89bd94d79d5ce89b27e9a */
declare var allowSpiralMoves: boolean;

/** Bitmask of allowed circular planes (PLANE_XY, PLANE_ZX, PLANE_YZ). Set to `undefined` for any plane.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8862ca499e5a7a3cfc4ece721f91b4b0 */
declare var allowedCircularPlanes: number | undefined;

/** The high feedrate value used for rapid substitution. Set per unit system.
 * @example
 * highFeedrate = (unit == MM) ? 9999 : 999;
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#abeabefafe235ec1a3b842eb1e28e9e92 */
declare var highFeedrate: number;

/** Controls how rapids are mapped to high-feed moves. Use HIGH_FEED_* constants.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aac46c23bdff2208b8f8120a9fb14e3f6 */
declare var highFeedMapping: number;

/** The output unit (MM or IN).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aa63cd118027e6af31ecb0a9a45085e43 */
declare var unit: number;

/** Allow mapping of work origin.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a243007459395443b0a118597f18a824e */
declare var mapWorkOrigin: boolean;

/** Map coordinates to WCS.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a98351569a835994527b95d62194f279c */
declare var mapToWCS: boolean;

/** Allow machine change on section (multi-machine programs).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#abec0571054956f7e2f6b1fa8fa04f62e */
declare var allowMachineChangeOnSection: boolean;

/** The program name. */
declare var programName: string;

/** True if the program name is an integer. */
declare var programNameIsInteger: boolean;

/** True if running in debug mode. */
declare var debugMode: boolean;

/** The post processor revision number (set by the engine). */
declare var revision: number;

/** Set to true to mark this post as deprecated. */
declare var deprecated: boolean;

/** Set to true to prevent the post from running. */
declare var preventPost: boolean;

/** Abort on deprecated function calls. */
declare var abortOnDeprecation: boolean;

/** Set to true to allow probing with multiple features. */
declare var probeMultipleFeatures: boolean;

/** The circular input tolerance. */
declare var circularInputTolerance: number;

/** The circular merge tolerance. */
declare var circularMergeTolerance: number;

/** Controls whether the post supports TWP (tilted work planes). */
declare var controlSupportsTWP: boolean;

/** The Euler convention for rotary output. */
declare var eulerConvention: number;

/** The work plane calculation method. */
declare var workPlaneCalculationMethod: number;

/** Allow feed-per-revolution for drilling. */
declare var allowFeedPerRevolutionDrilling: number;

/** Whether to buffer rotary moves. */
declare var bufferRotaryMoves: boolean;

/** Supported features bitmask. */
declare var supportedFeatures: number;

/** Keywords string (space-separated, e.g. "MODEL_IMAGE PREVIEW_IMAGE"). */
declare var keywords: string;

// ===========================================================================
//  GLOBAL RUNTIME STATE
//  Available during post processing (read-only unless noted).
// ===========================================================================

/** The current section being processed.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3f363483663847152552a6c19897c842 */
declare var currentSection: Section;

/** The current tool.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a95ceb07ef37166fe2eb4a49196ec22d2 */
declare var tool: Tool;

/** The current feedrate.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a33ca84fc3441ef9e94208a59659de8e2 */
declare var feedrate: number;

/** The current spindle speed.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#acf8176fc3ff71d9cec8246689c6551a8 */
declare var spindleSpeed: number;

/** The current movement type constant (MOVEMENT_*).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a797d5b9f2e1a2c5fabbe4707d5beb5f7 */
declare var movement: number;

/** The current radius compensation mode (RADIUS_COMPENSATION_*).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af956c33b96a391f96de8b64ae7ce58a4 */
declare var radiusCompensation: number;

/** The current active feed mode. */
declare var activeFeedMode: number;

/** The spindle axis index. */
declare var spindleAxis: number;

/** The current cycle type string (e.g. "drilling", "tapping").
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8fae97ae25950a6f22a9abb097b06c23 */
declare var cycleType: string;

/** The current cycle parameters. Available during onCycle() and onCyclePoint().
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#acc223e94c02031add0ecad7bda263ab4 */
declare var cycle: CycleParameters;

/** True if the current cycle has been expanded.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aff308c18e5596197b74a5228552b512c */
declare var cycleExpanded: boolean;

/** The initial cycle position.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8c30a2b6f665bd561e959cc8a4e85bd2 */
declare var initialCyclePosition: Vector;

/** The machine configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a754d1d3ad5f53d86f01e30c37444ec7e */
declare var machineConfiguration: MachineConfiguration;

/** Machine-specific parameters (chip breaking distance, etc.).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3278d7f9975131c82562c7b467cb8a0d */
declare var machineParameters: MachineParameters;

/** The simulation interface.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a9959b171e9934828d26b506a04b34dfb */
declare var simulation: Simulation;

/** The output unit for the current session. */
declare var outputUnit: number;

/** User-defined properties map. Define at top level; the engine populates values from the UI.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a1e996849c5d6bd0559736d2f8c8ffa1f */
declare var properties: any;

/** The current line number counter (writable). */
declare var lineNumber: number;

// Circular motion state (available during onCircular)
/** The end point of the current motion. */
declare var end: Vector;
/** The arc/segment length. */
declare var length: number;
/** The center of the current circular motion. */
declare var circularCenter: Vector;
/** The offset from the start to the center of the circular motion. */
declare var circularOffset: Vector;
/** The normal of the current circular plane. */
declare var circularNormal: Vector;
/** The circular plane (PLANE_XY, PLANE_ZX, PLANE_YZ, or -1). */
declare var circularPlane: number;
/** The radius of the current circular motion. */
declare var circularRadius: number;
/** The starting radius of the current circular motion. */
declare var circularStarttRadius: number;
/** The sweep angle (radians) of the current circular motion. */
declare var circularSweep: number;
/** True if the current circular motion is clockwise. */
declare var circularClockwise: boolean;
/** The chord length of the current circular motion. */
declare var circularChordLength: number;
/** The arc length of the current circular motion. */
declare var circularArcLength: number;
/** True if the current circular motion is a full circle. */
declare var circularFullCircle: boolean;
/** True if the current circular motion is helical. */
declare var circularHelical: boolean;
/** True if the current circular motion is a spiral. */
declare var circularSpiral: boolean;
/** The helical offset for the current circular motion. */
declare var circularHelicalOffset: Vector;
/** The helical distance for the current circular motion. */
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

/** Writes text to the output file without a newline.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a32071fff63a93a3494979e835aaacc9a */
declare function write(message: string): void;

/** Writes text to the output file followed by a newline.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aeb90bf455982d43746741f6dce58279c */
declare function writeln(message: string): void;

/** Writes non-empty arguments separated by the word separator, followed by a newline.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a2e458cd4cdf20806ac7afaf13232a779 */
declare function writeWords(...words: string[]): void;

/** Like writeWords but uses a secondary word separator.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a26a51e1eef93cfd3f7dcf66da436583b */
declare function writeWords2(...words: string[]): void;

/** Formats words and returns the concatenated string (without writing).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a891175b41f166fce83100d6cbd6d4504 */
declare function formatWords(...words: string[]): string;

/** Returns the word separator.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ada0c57582300da66213635ccc64c8e7f */
declare function getWordSeparator(): string;

/** Sets the word separator.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aea95987c6248d8d46db8e7481609fe4d */
declare function setWordSeparator(separator: string): void;

/** Writes the tool table to the output. */
declare function writeToolTable(orderBy?: number): void;

/** Writes section notes. */
declare function writeSectionNotes(): void;

/** Writes setup notes. */
declare function writeSetupNotes(): void;

// ---- Error / Logging Functions ----

/** Outputs an error and stops post processing.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a41de7e97313422e0fa1ff6265901b0e8 */
declare function error(message: string): void;

/** Outputs a warning.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a142480b11a33b89259a93b16d67b35b9 */
declare function warning(message: string): void;

/** Outputs a warning only once (by ID).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a7c84675981a0f7e9672c2653298b344d */
declare function warningOnce(message: string, id: number): void;

/** Outputs a debug/log message.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a5d7d1f99129bbc3846054e8d5b70cb48 */
declare function log(message: string): void;

/** Outputs a debug message. */
declare function debug(message: string): void;

/** Validates that expression is truthy; throws error with message if not.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a37d7c88322479cc4b8775219c7104161 */
declare function validate(expression: any, message: string): void;

// ---- Unit / Conversion Functions ----

/** Converts a value from the specified unit to the output unit.
 * @example
 * tolerance = spatial(0.002, MM);
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a237487f4656f95641ef1d26ca62b7b01 */
declare function spatial(value: number, unit: number): number;

/** Converts a value from the input unit to the specified output unit.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a7de682c8593fcacc60e146467563e52d */
declare function toUnit(value: number, unit: number): number;

/** Converts a value to the specified unit with full precision (no rounding).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a2f33c593779c135e774347331310dd14 */
declare function toPreciseUnit(value: number, unit: number): number;

/** Converts radians to degrees.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a27965dc305215f673efcea4330d2431a */
declare function toDeg(radians: number): number;

/** Converts degrees to radians.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a40562fe347c39025af57410c92c2c373 */
declare function toRad(degrees: number): number;

/** Parses a spatial value string. */
declare function parseSpatial(value: string): number;

// ---- Section / Navigation Functions ----

/** Returns the total number of sections.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a057dfc309ce401ba7b500c9f02932400 */
declare function getNumberOfSections(): number;

/** Returns the section at the given index.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#af315a19e0323fb203e0722c78cd8489e */
declare function getSection(index: number): Section;

/** Returns the ID of the current section. */
declare function getCurrentSectionId(): number;

/** Returns the previous section. */
declare function getPreviousSection(): Section;

/** Returns true if there is a next section. */
declare function hasNextSection(): boolean;

/** Returns the next section. */
declare function getNextSection(): Section;

/** Returns true if this is the first section. */
declare function isFirstSection(): boolean;

/** Returns true if this is the last section. */
declare function isLastSection(): boolean;

/** Returns true if the current section is a milling section. */
declare function isMilling(): boolean;

/** Returns true if the current section is a turning section. */
declare function isTurning(): boolean;

/** Returns true if the current section is a jet section (waterjet/laser/plasma). */
declare function isJet(): boolean;

/** Returns true if the program is 3-axis only. */
declare function is3D(): boolean;

/** Returns true if the program contains multi-axis (5-axis) operations. */
declare function isMultiAxis(): boolean;

// ---- Position / Transformation Functions ----

/** Returns the current position.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a067bc8148cdc35daadb8afb07ec3f63a */
declare function getCurrentPosition(): Vector;

/** Sets the current position (use after expanded cycles or manual motion).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a4f55914630113a4e4d015f425385156a */
declare function setCurrentPosition(position: Vector): void;

/** Transforms a section-local position through the active frame rotation/translation.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a16fc4a2c23c1cc1514ff7c58a4c9bce0 */
declare function getFramePosition(position: Vector): Vector;

/** Transforms a direction through the active frame rotation.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a5f40fc8085854d4890cc4c9c685c58cc */
declare function getFrameDirection(direction: Vector): Vector;

/** Returns the global position from a section-local position. */
declare function getGlobalPosition(p: Vector): Vector;

/** Returns the WCS position from a section-local position. */
declare function getWCSPosition(p: Vector): Vector;

/** Returns the current global position. */
declare function getCurrentGlobalPosition(): Vector;

/** Returns the current direction. */
declare function getCurrentDirection(): Vector;

/** Sets the current direction. */
declare function setCurrentDirection(direction: Vector): void;

/** Returns the current ABC angles. */
declare function getCurrentABC(): Vector;

/** Sets the current ABC angles. */
declare function setCurrentABC(abc: Vector): void;

/** Returns the current tool axis. */
declare function getCurrentToolAxis(): Vector;

/** Returns the current spindle speed. */
declare function getCurrentSpindleSpeed(): number;

/** Sets the output rotation matrix.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a41162be7196b5b671c195807c9bbb7fc */
declare function setRotation(rotation: Matrix): void;

/** Cancels any active rotation. */
declare function cancelRotation(): void;

/** Sets the output translation.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a3d7f8b45d5022e52d44b05540674c17c */
declare function setTranslation(translation: Vector): void;

/** Cancels any active translation. */
declare function cancelTranslation(): void;

/** Cancels both rotation and translation. */
declare function cancelTransformation(): void;

/** Returns the current rotation matrix. */
declare function getRotation(): Matrix;

/** Returns the current translation vector. */
declare function getTranslation(): Vector;

// ---- Machine Configuration Functions ----

/** Returns the machine configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a50d1979cdb845a2b7c34301136930623 */
declare function getMachineConfiguration(): MachineConfiguration;

/** Sets the machine configuration.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#ad38400d98dcd5a7ac881ba38ee096187 */
declare function setMachineConfiguration(machine: MachineConfiguration): void;

/** Creates a new machine configuration from specifiers. */
declare function createMachineConfiguration(specifiers: object): MachineConfiguration;

/** Creates a machine axis from specifiers (coordinate, axis, table, range, etc.).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8803b36be6893a81991049766abe0794 */
declare function createAxis(specifiers: object): Axis;

/** Optimizes multi-axis machine angles. */
declare function optimizeMachineAngles(): void;

/** Optimizes machine angles with type control. */
declare function optimizeMachineAngles2(optimizeType: number): void;

/** Optimizes machine angles for a specific machine. */
declare function optimizeMachineAnglesByMachine(machine: MachineConfiguration, optimizeType: number): void;

/** Returns multi-axis move lengths. */
declare function getMultiAxisMoveLength(x: number, y: number, z: number, a: number, b: number, c: number): MoveLength;

// ---- Format / Variable Creation Functions ----

/** Creates a number format.
 *
 * Supported specifiers: `decimals`, `forceDecimal`, `forceSign`, `width`,
 * `zeropad`, `separator`, `scale`, `cyclicLimit`, `cyclicSign`, `prefix`, `suffix`, `inherit`, `trim`, `trimLeadZero`.
 * @example
 * var xyzFormat = createFormat({decimals: 3, forceDecimal: true});
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a0595eae6f27f88872305a126a5db119b */
declare function createFormat(specifiers: object): FormatNumber;

/** Creates an output variable (prefix + format + modal/force behavior).
 *
 * Supported specifiers: `prefix`, `suffix`, `force`, `onchange`, `type`.
 * @example
 * var xOutput = createOutputVariable({prefix: "X"}, xyzFormat);
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a8058a96192a419464ec439ad745a3f97 */
declare function createOutputVariable(specifiers: object, format: FormatNumber): OutputVariable;

/** Creates a simple modal variable.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#aacf9c27543d7dbec4d66d7e37a259ad3 */
declare function createVariable(specifiers: object, format: FormatNumber): Variable;

/** Creates an incremental variable. */
declare function createIncrementalVariable(specifiers: object, format: FormatNumber): IncrementalVariable;

/** Creates a reference variable. */
declare function createReferenceVariable(specifiers: object, format: FormatNumber): ReferenceVariable;

/** Creates a modal (prefix + format, outputs only on change).
 * @example
 * var gMotionModal = createModal({force: true}, gFormat);
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a171d6ddae8c04c1ad624561972ad86fd */
declare function createModal(specifiers: object, format: FormatNumber): Modal;

/** Creates a modal group. */
declare function createModalGroup(specifiers: object, groups: any[], format: FormatNumber): ModalGroup;

// ---- Cycle Functions ----

/** Expands the current cycle point into linear moves (calls onRapid/onLinear).
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#adcaaa09d41e9c6b4434cbc54fa5260e1 */
declare function expandCyclePoint(x: number, y: number, z: number): void;

/** Repositions to the cycle clearance plane. */
declare function repositionToCycleClearance(cycle: CycleParameters, x: number, y: number, z: number): void;

/** Raises an error indicating the cycle is not supported. */
declare function cycleNotSupported(): void;

/** Returns true if this is the first cycle point. */
declare function isFirstCyclePoint(): boolean;

/** Returns true if this is the last cycle point. */
declare function isLastCyclePoint(): boolean;

/** Returns the ID of the current cycle point. */
declare function getCyclePointId(): number;

/** Returns the total number of cycle points. */
declare function getNumberOfCyclePoints(): number;

/** Returns the cycle point at the given index. */
declare function getCyclePoint(index: number): Vector;

/** Returns true if the given cycle URI is a probing cycle. */
declare function isProbingCycle(uri: string): boolean;

/** Returns true if the cycle is a sub-spindle cycle. */
declare function isSubSpindleCycle(uri: string): boolean;

/** Returns true if the current cycle is a well-known cycle type. */
declare function isWellKnownCycle(): boolean;

// ---- Tool Functions ----

/** Returns the tool table for the program. */
declare function getToolTable(): ToolTable;

/** Returns the first tool. */
declare function getFirstTool(): Tool;

/** Returns the next tool after the given tool number. */
declare function getNextTool(number: number): Tool;

/** Returns the tool list. */
declare function getToolList(arguments_: string, flag: number): Tool[];

/** Returns the tool type name string. */
declare function getToolTypeName(tool: Tool | number): string;

/** Returns true if a tool change is needed for the given section. */
declare function isToolChangeNeeded(section: Section, arguments_?: string): boolean;

/** Returns the machining distance for a tool. */
declare function getMachiningDistance(tool: number): number;

// ---- Parameter Functions ----

/** Returns true if a global parameter exists. */
declare function hasGlobalParameter(name: string): boolean;

/** Returns the value of a global parameter. */
declare function getGlobalParameter(name: string, defaultValue?: any): any;

/** Returns true if the current record has the named parameter. */
declare function hasParameter(name: string): boolean;

/** Returns the value of a parameter for the current record. */
declare function getParameter(name: string, defaultValue?: any): any;

/** Returns a property value. */
declare function getProperty(property: any, defaultValue?: any): any;

/** Sets a property value. */
declare function setProperty(property: any, value: any): void;

/** Validates property definitions. */
declare function validatePropertyDefinitions(): boolean;

/** Validates property values. */
declare function validateProperties(): boolean;

// ---- Work Plane / Offset Functions ----

/** Returns true if the work plane has changed from the previous section. */
declare function isNewWorkPlane(section: Section): boolean;

/** Returns true if the work offset has changed from the previous section. */
declare function isNewWorkOffset(section: Section): boolean;

// ---- Circular Motion Query Functions (available during onCircular) ----

/** Returns the circular center. */
declare function getCircularCenter(): Vector;
/** Returns the circular offset (from start to center). */
declare function getCircularOffset(): Vector;
/** Returns the circular start radius. */
declare function getCircularStartRadius(): number;
/** Returns the circular radius. */
declare function getCircularRadius(): number;
/** Returns the circular sweep angle in radians. */
declare function getCircularSweep(): number;
/** Returns the circular chord length. */
declare function getCircularChordLength(): number;
/** Returns the circular arc length. */
declare function getCircularArcLength(): number;
/** Returns true if the current arc is clockwise. */
declare function isClockwise(): boolean;
/** Returns true if the current arc is a full circle. */
declare function isFullCircle(): boolean;
/** Returns true if the current arc is helical. */
declare function isHelical(): boolean;
/** Returns true if the current arc is a spiral. */
declare function isSpiral(): boolean;
/** Returns the circular normal. */
declare function getCircularNormal(): Vector;
/** Returns the circular plane. */
declare function getCircularPlane(): number;
/** Returns the helical offset. */
declare function getHelicalOffset(): Vector;
/** Returns the helical distance. */
declare function getHelicalDistance(): number;
/** Returns the helical pitch. */
declare function getHelicalPitch(): number;
/** Returns true if the circular motion can be linearized. */
declare function canLinearize(): boolean;
/** Linearizes the current circular motion. */
declare function linearize(tolerance: number): void;
/** Returns the number of linearization segments needed. */
declare function getNumberOfSegments(tolerance: number): number;
/** Returns the interpolated position at parameter u (0..1). */
declare function getPositionU(u: number): Vector;
/** Returns the end point of the current motion. */
declare function getEnd(): Vector;
/** Returns the length of the current motion. */
declare function getLength(): number;
/** Returns the feedrate of the current motion. */
declare function getFeedrate(): number;
/** Returns the current movement type. */
declare function getMovement(): number;
/** Returns the current power state. */
declare function getPower(): boolean;
/** Returns the current spindle speed. */
declare function getSpindleSpeed(): number;
/** Returns the current radius compensation mode. */
declare function getRadiusCompensation(): number;

// ---- Redirection Functions ----

/** Returns true if output is being redirected. */
declare function isRedirecting(): boolean;
/** Redirects output to a file. */
declare function redirectToFile(path: string): void;
/** Redirects output to a buffer. */
declare function redirectToBuffer(): void;
/** Returns the redirection buffer contents. */
declare function getRedirectionBuffer(): string;
/** Returns the redirection buffer contents and optionally clears it. */
declare function getRedirectionBuffer2(clear: boolean): string;
/** Closes the redirection. */
declare function closeRedirection(): void;

// ---- Path / File Functions ----

/** Returns the intermediate CNC file path. */
declare function getIntermediatePath(): string;
/** Returns the output file path. */
declare function getOutputPath(): string;
/** Returns the configuration folder. */
declare function getConfigurationFolder(): string;
/** Returns the configuration script path. */
declare function getConfigurationPath(): string;
/** Returns the post processor folder. */
declare function getPostProcessorFolder(): string;
/** Returns the post processor path. */
declare function getPostProcessorPath(): string;
/** Includes another script file.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a92ca78e202ec522d37d4773ec3a37541 */
declare function include(path: string): void;
/** Finds a file by path (checks multiple locations). */
declare function findFile(path: string): string;

// ---- Localization Functions ----

/** Translates a message using locale files.
 * @see https://cam.autodesk.com/posts/reference/classPostProcessor.html#a336174d3ff096f7bcb809c6fb3893e23 */
declare function localize(message: string): string;

/** Translates a message with a section qualifier. */
declare function localize2(section: string, message: string): string;

/** Returns the language ID. */
declare function getLangId(): string;

/** Loads a locale. */
declare function loadLocale(langId: string): boolean;

// ---- Code Page Functions ----

/** Returns the code page. */
declare function getCodePage(): number;

/** Sets the code page (e.g. "ascii", "ansi", "utf-8"). */
declare function setCodePage(name: string): void;

// ---- Text Utility Functions ----

/** Returns the value if condition is true, otherwise empty string. */
declare function conditional(condition: any, value: string): string;

/** Returns true if the text contains only safe characters. */
declare function isSafeText(text: string, permitted: string): boolean;

/** Filters text to keep only specified characters. */
declare function filterText(text: string, keep: string): string;

/** Translates characters in text (maps src chars to dest chars). */
declare function translateText(text: string, src: string, dest: string): string;

/** Substitutes placeholders in a format string. */
declare function subst(message: string, ...args: any[]): string;

/** Loads text from a URL or file. */
declare function loadText(url: string, encoding?: string): string;

/** Parses a string as a float. */
declare function getAsFloat(text: string): number;

/** Parses a string as an integer. */
declare function getAsInt(text: string): number;

// ---- Misc Functions ----

/** Returns the output unit. */
declare function getOutputUnit(): number;
/** Sets the output unit (MM or IN). */
declare function setOutputUnit(unit: number): void;
/** Returns true if dog-leg motion is active. */
declare function getDogLeg(): boolean;
/** Sets dog-leg motion mode. */
declare function setDogLeg(dogLeg: boolean): void;
/** Sets the end-of-line marker. */
declare function setEOL(eol: string): void;
/** Sets the exit code for the post engine. */
declare function setExitCode(code: number): void;
/** Skips the rest of the current section. */
declare function skipRemainingSection(): void;
/** Returns true if speed-feed synchronization is active. */
declare function isSpindleSpeedDifferent(section: Section): boolean;
/** Returns the inverse time feedrate. */
declare function getInverseTime(distance: number, speed: number): number;
/** Returns the plane for a given direction vector. */
declare function getPlane(direction: Vector): number;
/** Converts a plane constant to an ISO plane constant. */
declare function getISOPlane(plane: number): number;
/** Returns true if two directions are the same. */
declare function isSameDirection(a: any, b: any): boolean;
/** Returns the quadrant for an angle. */
declare function getQuadrant(angle: number): number;
/** Returns the workpiece bounding box. */
declare function getWorkpiece(): BoundingBox;
/** Returns the fixture bounding box. */
declare function getFixture(): BoundingBox;
/** Returns true if a workpiece is defined. */
declare function isWorkpieceDefined(): boolean;
/** Gets program name as an integer within range. */
declare function getProgramNameAsInt(min: number, max: number): number;
/** Gets program name as a string within character limit. */
declare function getProgramNameAsString(charLimit: number): string;
/** Gets the Z range across the whole toolpath. */
declare function toolZRange(): Range;
/** Gets the system unit. */
declare function getSystemUnit(): number;
/** Gets the platform string. */
declare function getPlatform(): string;
/** Gets the product name. */
declare function getProduct(): string;
/** Gets the product version. */
declare function getVersion(): string;
/** Returns a coolant name string. */
declare function getCoolantName(coolant: number): string;
/** Returns a material name string. */
declare function getMaterialName(material: number): string;
/** Returns a command string identifier. */
declare function getCommandStringId(command: number): string;
/** Returns true if the command is well-known. */
declare function isWellKnownCommand(command: number): boolean;
/** Returns true if the command can be safely ignored. */
declare function canIgnoreCommand(command: number): boolean;
/** Handles an unsupported command. */
declare function onUnsupportedCommand(command: number): void;
/** Handles an unsupported coolant. */
declare function onUnsupportedCoolant(coolant: number): void;
/** Registers a termination handler function. */
declare function registerTerminationHandler(fn: Function): void;
/** Registers a post-processing step. */
declare function registerPostProcessing(path: string): void;
/** Loads a machine configuration from file. */
declare function loadMachineConfiguration(path: string): MachineConfiguration;
/** Returns true if user interaction is allowed. */
declare function isInteractionAllowed(): boolean;
/** Returns the security level. */
declare function getSecurityLevel(): number;
/** Returns the number of records. */
declare function getNumberOfRecords(): number;
/** Returns a record by ID. */
declare function getRecord(id: number): Record;
/** Returns the current record ID. */
declare function getCurrentRecordId(): number;
/** Returns true if the current cycle point is being expanded. */
declare function isExpanding(): boolean;
/** Checks whether a section is a probe operation. */
declare function isProbeOperation(section: Section): boolean;
/** Checks whether a section is an inspection operation. */
declare function isInspectionOperation(section: Section): boolean;
/** Checks whether a section is a deposition operation. */
declare function isDepositionOperation(section: Section): boolean;
/** Checks whether a section is a drilling cycle. */
declare function isDrillingCycle(section: Section, checkBoringCycles?: boolean): boolean;
/** Checks whether a section is a tapping cycle. */
declare function isTappingCycle(section: Section): boolean;
/** Checks whether a section is an axial center drilling. */
declare function isAxialCenterDrilling(section: Section, checkLiveTool?: boolean): boolean;
/** Checks whether a section is a milling cycle. */
declare function isMillingCycle(section: Section, checkBoringCycles?: boolean): boolean;
/** Generates an array of numbers. */
declare function range(first: number, end: number, step?: number): number[];
/** Generates a two-element interval array. */
declare function interval(from: number, to: number): number[];
/** Flattens a nested array. */
declare function flatten(array: any[]): any[];

// ---- Invoke Functions (re-dispatch motion) ----

/** Re-invokes onRapid with the given coordinates. */
declare function invokeOnRapid(x: number, y: number, z: number): boolean;
/** Re-invokes onLinear with the given coordinates. */
declare function invokeOnLinear(x: number, y: number, z: number, feedrate: number): boolean;
/** Re-invokes onRapid5D. */
declare function invokeOnRapid5D(x: number, y: number, z: number, dx: number, dy: number, dz: number): boolean;
/** Re-invokes onLinear5D. */
declare function invokeOnLinear5D(x: number, y: number, z: number, dx: number, dy: number, dz: number, feedrate: number): boolean;
/** Re-invokes onCircular. */
declare function invokeOnCircular(clockwise: boolean, cx: number, cy: number, cz: number, x: number, y: number, z: number, nx: number, ny: number, nz: number, feedrate: number): boolean;
/** Re-invokes onSpindleSpeed. */
declare function invokeOnSpindleSpeed(spindleSpeed: number): boolean;
/** Called for implied commands. */
declare function onImpliedCommand(command: number): void;

// ---- Polar Mode Functions ----

/** Activates polar interpolation mode. */
declare function activatePolarMode(tolerance: number, currentAngle: number, polarDirection: Vector, interpolateRapidMoves: boolean, optimizeType: number): VectorPair;
/** Deactivates polar mode. */
declare function deactivatePolarMode(): void;
/** Returns true if polar mode is active. */
declare function isPolarModeActive(): boolean;
/** Returns the polar position. */
declare function getPolarPosition(x: number, y: number, z: number): VectorPair;
/** Activates automatic polar mode handling. */
declare function activateAutoPolarMode(options: object): void;

// ---- Expanded motion callbacks (called by expandCyclePoint) ----

/** Called for expanded rapid motion. */
declare function onExpandedRapid(x: number, y: number, z: number): void;
/** Called for expanded linear motion. */
declare function onExpandedLinear(x: number, y: number, z: number, feed: number): void;
/** Called for expanded spindle speed changes. */
declare function onExpandedSpindleSpeed(spindleSpeed: number): void;

// ---- Record navigation ----

/** Returns true if a previous record exists. */
declare function hasPreviousRecord(): boolean;
/** Returns the previous record. */
declare function getPreviousRecord(): Record;
/** Returns true if a next record exists. */
declare function hasNextRecord(): boolean;
/** Returns the next record. */
declare function getNextRecord(): Record;

// ===========================================================================
//  ENTRY FUNCTIONS (implement in your .cps file)
// ===========================================================================

/** Called when the machine configuration changes. */
declare function onMachine(): void;

/** Called once at post processing initialization. Output the program header here.
 * @see https://cam.autodesk.com/posts/reference/entry_functions.html */
declare function onOpen(): void;

/** Called for each name-value parameter pair in the CLD data. */
declare function onParameter(name: string, value: any): void;

/** Called for pass-through text. */
declare function onPassThrough(value: any): void;

/** Called for each comment. */
declare function onComment(comment: string): void;

/** Called at the start of each section (operation). */
declare function onSection(): void;

/** Called for special cycle sections. */
declare function onSectionSpecialCycle(): void;

/** Called for dwell commands. */
declare function onDwell(seconds: number): void;

/** Called when spindle speed changes. */
declare function onSpindleSpeed(spindleSpeed: number): void;

/** Called for each linear rapid motion.
 * Prevent dog-leg movement in the generated program. */
declare function onRapid(x: number, y: number, z: number): void;

/** Called for each linear feed motion. */
declare function onLinear(x: number, y: number, z: number, feedrate: number): void;

/** Called for each circular motion. */
declare function onCircular(clockwise: boolean, cx: number, cy: number, cz: number, x: number, y: number, z: number, feedrate: number): void;

/** Called for each 5-axis rapid motion. */
declare function onRapid5D(x: number, y: number, z: number, dx: number, dy: number, dz: number): void;

/** Called for each 5-axis linear feed motion. */
declare function onLinear5D(x: number, y: number, z: number, dx: number, dy: number, dz: number, feedrate: number): void;

/** @deprecated Use onRewindMachineEntry. Called when machine axis rewind is required. */
declare function onRewindMachine(a: number, b: number, c: number): void;

/** Called before a machine rewind procedure. */
declare function onRewindMachineEntry(a: number, b: number, c: number): void;

/** Required for rewinds. Retract to safe position before indexing. */
declare function onMoveToSafeRetractPosition(): void;

/** Required for rewinds. Return from safe position after indexing. */
declare function onReturnFromSafeRetractPosition(x: number, y: number, z: number): void;

/** Required for rewinds. Rotate axes to new position. */
declare function onRotateAxes(x: number, y: number, z: number, a: number, b: number, c: number): void;

/** Called when the movement type changes. */
declare function onMovement(movement: number): void;

/** Called when power mode changes (for waterjet/laser/plasma). */
declare function onPower(power: boolean): void;

/** Called when radius compensation mode changes. */
declare function onRadiusCompensation(): void;

/** Called when feed mode changes. */
declare function onFeedMode(mode: number): void;

/** Called when tool compensation mode changes. */
declare function onToolCompensation(compensation: number): void;

/** Called at the beginning of each cycle. */
declare function onCycle(): void;

/** Called for each point in the active cycle. */
declare function onCyclePoint(x: number, y: number, z: number): void;

/** Called at the beginning of a cycle with toolpath. */
declare function onCyclePath(): void;

/** Called at the end of a cycle with toolpath. */
declare function onCyclePathEnd(): void;

/** Called on cycle completion. */
declare function onCycleEnd(): void;

/** Called for well-known commands (e.g. stop spindle). */
declare function onCommand(command: number): void;

/** Called for Manual NC commands. */
declare function onManualNC(command: number, value: string): void;

/** Called for machine commands. */
declare function onMachineCommand(command: number): void;

/** Called when spindle orientation is required. */
declare function onOrientateSpindle(angle: number): void;

/** Called after the last posted operation of a Part Alignment. */
declare function onLiveAlignment(): void;

/** Called for additive FFF linear extrusion motion. */
declare function onLinearExtrude(x: number, y: number, z: number, feedrate: number, extrusionLength: number): void;

/** Called for additive FFF circular extrusion motion. */
declare function onCircularExtrude(clockwise: boolean, cx: number, cy: number, cz: number, x: number, y: number, z: number, feedrate: number, extrusionLength: number): void;

/** Called at the start of an additive layer. */
declare function onLayer(layerNumber: number): void;

/** Called at the end of an additive DED layer. */
declare function onLayerEnd(layerNumber: number): void;

/** Called when FFF extrusion length resets. */
declare function onExtrusionReset(length: number): void;

/** Called when the FFF extruder changes. */
declare function onExtruderChange(extruderId: number): void;

/** Called when FFF extruder temperature changes. */
declare function onExtruderTemp(temp: number, wait: boolean, extruderId: number): void;

/** Called when FFF bed temperature changes. */
declare function onBedTemp(temp: number, wait: boolean): void;

/** Called when FFF fan speed changes. */
declare function onFanSpeed(speed: number, fanId: number): void;

/** Called when FFF max acceleration changes. */
declare function onMaxAcceleration(xAxis: number, yAxis: number, zAxis: number, eAxis: number): void;

/** Called when FFF acceleration changes. */
declare function onAcceleration(travel: number, printing: number, retract: number): void;

/** Called when FFF jerk changes. */
declare function onJerk(xAxis: number, yAxis: number, zAxis: number, eAxis: number): void;

/** Called at the end of each section (operation). */
declare function onSectionEnd(): void;

/** Called at the end of special cycle sections. */
declare function onSectionEndSpecialCycle(): void;

/** Called at post processing completion. Output the program footer here. */
declare function onClose(): void;

/** Called after post processing has completed. The output file is unlocked. */
declare function onTerminate(): void;
