import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
    Search,
    MessageSquare,
    Send,
    Users,
    User,
    Building2,
    Phone,
    Mail,
    MessageCircle,
    Volume2,
    CheckCircle,
    Clock,
    XCircle,
    Plus,
    Eye,
    Edit,
} from "lucide-react"

const messageHistory = [
    {
        id: 1,
        type: "broadcast",
        title: "System Maintenance Notice",
        content:
            "PayRep Kidashi will undergo scheduled maintenance on Sunday, January 21st from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.",
        recipients: "All Users",
        recipientCount: 1247,
        channels: ["sms"],
        sentAt: "2024-01-15 10:00:00",
        status: "delivered",
        deliveryRate: 98.5,
        readRate: 87.2,
        createdBy: "Admin User",
    },
    {
        id: 2,
        type: "community",
        title: "Loan Repayment Reminder",
        content:
            "Dear members of Katsina Women Cooperative, this is a friendly reminder that your loan repayment is due in 3 days. Please ensure timely payment to maintain your good standing.",
        recipients: "Katsina Women Cooperative",
        recipientCount: 12,
        channels: ["sms"],
        sentAt: "2024-01-15 09:30:00",
        status: "delivered",
        deliveryRate: 100,
        readRate: 91.7,
        createdBy: "Loan Officer",
    },
    {
        id: 3,
        type: "individual",
        title: "Overdue Payment Alert",
        content:
            "Hello Zainab Usman, your loan payment of ₦8,000 is now 15 days overdue. Please contact your vendor or make payment immediately to avoid penalties.",
        recipients: "Zainab Usman",
        recipientCount: 1,
        channels: ["sms"],
        sentAt: "2024-01-15 08:45:00",
        status: "delivered",
        deliveryRate: 100,
        readRate: 100,
        createdBy: "System Automated",
    },
    {
        id: 4,
        type: "vendor",
        title: "New Community Member",
        content:
            "Congratulations! A new member, Grace Adebayo, has joined your Lagos Market Women community. Please ensure proper onboarding and documentation.",
        recipients: "Blessing Provisions",
        recipientCount: 1,
        channels: ["sms", "in_app"],
        sentAt: "2024-01-15 07:20:00",
        status: "delivered",
        deliveryRate: 100,
        readRate: 100,
        createdBy: "Community Manager",
    },
    {
        id: 5,
        type: "broadcast",
        title: "New Feature Announcement",
        content:
            "Exciting news! You can now purchase data bundles directly through PayRep Kidashi. Check out the new feature in your transaction menu.",
        recipients: "All Women",
        recipientCount: 894,
        channels: ["sms"],
        sentAt: "2024-01-14 16:00:00",
        status: "failed",
        deliveryRate: 45.2,
        readRate: 23.1,
        createdBy: "Product Manager",
        failureReason: "SMS gateway timeout",
    },
]

const messageTemplates = [
    {
        id: 1,
        name: "Loan Repayment Reminder",
        category: "loan_management",
        content:
            "Dear {user_name}, your loan payment of {amount} is due on {due_date}. Please ensure timely payment to maintain your good standing.",
        variables: ["user_name", "amount", "due_date"],
        usage: 45,
    },
    {
        id: 2,
        name: "Welcome New Member",
        category: "community",
        content:
            "Welcome to {community_name}, {user_name}! We're excited to have you join our community. Your vendor {vendor_name} will guide you through the onboarding process.",
        variables: ["community_name", "user_name", "vendor_name"],
        usage: 23,
    },
    {
        id: 3,
        name: "Loan Approval Notification",
        category: "loan_management",
        content:
            "Congratulations {user_name}! Your loan application for {amount} has been approved. Funds will be disbursed within 24 hours.",
        variables: ["user_name", "amount"],
        usage: 67,
    },
    {
        id: 4,
        name: "System Maintenance",
        category: "system",
        content:
            "PayRep Kidashi will undergo maintenance on {date} from {start_time} to {end_time}. Services may be temporarily unavailable.",
        variables: ["date", "start_time", "end_time"],
        usage: 8,
    },
]

const communicationStats = {
    totalMessages: messageHistory.length,
    deliveredMessages: messageHistory.filter((m) => m.status === "delivered").length,
    failedMessages: messageHistory.filter((m) => m.status === "failed").length,
    // averageDeliveryRate: messageHistory.reduce((sum, m) => sum + m.deliveryRate, 0) / messageHistory.length,
    // averageReadRate: messageHistory.reduce((sum, m) => sum + m.readRate, 0) / messageHistory.length,
}

export default function CommunicationCenter() {
    const [searchTerm, setSearchTerm] = useState("")
    const [_selectedMessage, setSelectedMessage] = useState<any>(null)
    const [isComposingMessage, setIsComposingMessage] = useState(false)
    const [newMessage, setNewMessage] = useState({
        type: "broadcast",
        title: "",
        content: "",
        recipients: "",
        channels: [] as string[],
    })

    const handleSendMessage = () => {
        console.log("[v0] Sending message:", newMessage)
        // Implementation for sending message
        setIsComposingMessage(false)
        setNewMessage({
            type: "broadcast",
            title: "",
            content: "",
            recipients: "",
            channels: [],
        })
    }

    const getMessageTypeIcon = (type: string) => {
        switch (type) {
            case "broadcast":
                return MessageSquare
            case "community":
                return Users
            case "individual":
                return User
            case "vendor":
                return Building2
            default:
                return MessageCircle
        }
    }

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case "sms":
                return MessageCircle
            // case "ussd":
            //     return Phone
            // case "voice_bot":
            //     return Volume2
            // case "in_app":
            //     return MessageSquare
            // case "vendor_notification":
            //     return Building2
            default:
                return Mail
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Communication Center</h1>
                    <p className="text-muted-foreground mt-2">
                        Send messages, manage communications, and track delivery across SMS, USSD, voice bot, and in-app channels.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Dialog open={isComposingMessage} onOpenChange={setIsComposingMessage}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Compose Message
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Compose New Message</DialogTitle>
                                <DialogDescription>
                                    Create and send messages to users through multiple communication channels
                                </DialogDescription>
                            </DialogHeader>
                            <ComposeMessageForm
                                message={newMessage}
                                setMessage={setNewMessage}
                                onSend={handleSendMessage}
                            // templates={messageTemplates}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{communicationStats.totalMessages}</div>
                        <p className="text-xs text-muted-foreground">total messages</p>
                    </CardContent>
                </Card>
                {/* <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {communicationStats.averageDeliveryRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">{communicationStats.deliveredMessages} delivered</p>
                    </CardContent>
                </Card> */}
                {/* <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Read Rate</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{communicationStats.averageReadRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Average engagement</p>
                    </CardContent>
                </Card> */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Failed Messages</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{communicationStats.failedMessages}</div>
                        <p className="text-xs text-muted-foreground">Require attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Communication Tabs */}
            <Tabs defaultValue="messages" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-card p-1 h-auto rounded-lg border shadow-sm">
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="messages">Message History</TabsTrigger>
                    <TabsTrigger className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md gap-1" value="templates">Message Templates</TabsTrigger>
                    {/* <TabsTrigger value="channels">Channel Analytics</TabsTrigger> */}
                </TabsList>

                {/* Message History Tab */}
                <TabsContent value="messages" className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {messageHistory.map((message) => {
                            const MessageIcon = getMessageTypeIcon(message.type)
                            return (
                                <Card key={message.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                    <MessageIcon className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">{message.title}</p>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <p className="text-xs text-muted-foreground">
                                                            To: {message.recipients} ({message.recipientCount} recipients)
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{new Date(message.sentAt).toLocaleString()}</p>
                                                        <p className="text-xs text-muted-foreground">By: {message.createdBy}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {message.channels.map((channel) => {
                                                            const ChannelIcon = getChannelIcon(channel)
                                                            return (
                                                                <div key={channel} className="flex items-center gap-1">
                                                                    <ChannelIcon className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-xs text-muted-foreground">{channel.replace("_", " ")}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span>Delivered: {message.deliveryRate}%</span>
                                                        <span>Read: {message.readRate}%</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            message.status === "delivered"
                                                                ? "default"
                                                                : message.status === "pending"
                                                                    ? "secondary"
                                                                    : "destructive"
                                                        }
                                                    >
                                                        {message.status === "delivered" && <CheckCircle className="h-3 w-3 mr-1" />}
                                                        {message.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                                        {message.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                                                        {message.status}
                                                    </Badge>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" onClick={() => setSelectedMessage(message)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Message Details</DialogTitle>
                                                                <DialogDescription>
                                                                    Complete information and delivery analytics for this message
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <MessageDetails message={message} />
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </TabsContent>

                {/* Message Templates Tab */}
                <TabsContent value="templates" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground">Pre-built message templates for common communications</p>
                        <Button variant="outline" className="bg-transparent">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Template
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {messageTemplates.map((template) => (
                            <Card key={template.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{template.name}</CardTitle>
                                            <CardDescription>
                                                Category: {template.category.replace("_", " ")} • Used {template.usage} times
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" className="bg-transparent">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" className="bg-transparent">
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-3">{template.content}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {template.variables.map((variable) => (
                                            <Badge key={variable} variant="outline" className="text-xs">
                                                {`{${variable}}`}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Channel Analytics Tab */}
                <TabsContent value="channels" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>SMS Channel</CardTitle>
                                <CardDescription>Text message delivery and engagement</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Messages Sent</span>
                                        <span className="font-medium">1,247</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Delivery Rate</span>
                                        <span className="font-medium">97.8%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Average Read Rate</span>
                                        <span className="font-medium">89.2%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Cost per Message</span>
                                        <span className="font-medium">₦2.50</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>USSD Channel</CardTitle>
                                <CardDescription>USSD notifications and prompts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Messages Sent</span>
                                        <span className="font-medium">894</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Delivery Rate</span>
                                        <span className="font-medium">99.1%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Response Rate</span>
                                        <span className="font-medium">76.4%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Cost per Message</span>
                                        <span className="font-medium">₦1.80</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Voice Bot Channel</CardTitle>
                                <CardDescription>Automated voice calls and messages</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Calls Made</span>
                                        <span className="font-medium">156</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Answer Rate</span>
                                        <span className="font-medium">82.7%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Completion Rate</span>
                                        <span className="font-medium">91.5%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Cost per Call</span>
                                        <span className="font-medium">₦8.50</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Vendor Notifications</CardTitle>
                                <CardDescription>Messages sent through vendor network</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Messages Sent</span>
                                        <span className="font-medium">342</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Delivery Rate</span>
                                        <span className="font-medium">94.2%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Confirmation Rate</span>
                                        <span className="font-medium">87.8%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Cost per Message</span>
                                        <span className="font-medium">₦0.50</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function ComposeMessageForm({
    message,
    setMessage,
    onSend,
    // templates,
}: {
    message: any
    setMessage: (message: any) => void
    onSend: () => void
    // templates: any[]
}) {
    const handleChannelChange = (channel: string, checked: boolean) => {
        if (checked) {
            setMessage({ ...message, channels: [...message.channels, channel] })
        } else {
            setMessage({ ...message, channels: message.channels.filter((c: string) => c !== channel) })
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="message-type">Message Type</Label>
                    <Select value={message.type} onValueChange={(value) => setMessage({ ...message, type: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select message type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="broadcast">Broadcast to All</SelectItem>
                            <SelectItem value="community">Community Message</SelectItem>
                            <SelectItem value="individual">Individual Message</SelectItem>
                            <SelectItem value="vendor">Vendor Message</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="recipients">Recipients</Label>
                    <Input
                        id="recipients"
                        placeholder={
                            message.type === "broadcast"
                                ? "All users"
                                : message.type === "community"
                                    ? "Community name"
                                    : "User name or phone"
                        }
                        value={message.recipients}
                        onChange={(e) => setMessage({ ...message, recipients: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Message Title</Label>
                <Input
                    id="title"
                    placeholder="Enter message title"
                    value={message.title}
                    onChange={(e) => setMessage({ ...message, title: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <Textarea
                    id="content"
                    placeholder="Enter your message content..."
                    rows={4}
                    value={message.content}
                    onChange={(e) => setMessage({ ...message, content: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label>Communication Channels</Label>
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="sms"
                            checked={message.channels.includes("sms")}
                            onCheckedChange={(checked) => handleChannelChange("sms", checked as boolean)}
                        />
                        <Label htmlFor="sms" className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            SMS
                        </Label>
                    </div>
                    {/* <div className="flex items-center space-x-2">
                        <Checkbox
                            id="ussd"
                            checked={message.channels.includes("ussd")}
                            onCheckedChange={(checked) => handleChannelChange("ussd", checked as boolean)}
                        />
                        <Label htmlFor="ussd" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            USSD
                        </Label>
                    </div> */}
                    {/* <div className="flex items-center space-x-2">
                        <Checkbox
                            id="voice_bot"
                            checked={message.channels.includes("voice_bot")}
                            onCheckedChange={(checked) => handleChannelChange("voice_bot", checked as boolean)}
                        />
                        <Label htmlFor="voice_bot" className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4" />
                            Voice Bot
                        </Label>
                    </div> */}
                    {/* <div className="flex items-center space-x-2">
                        <Checkbox
                            id="vendor_notification"
                            checked={message.channels.includes("vendor_notification")}
                            onCheckedChange={(checked) => handleChannelChange("vendor_notification", checked as boolean)}
                        />
                        <Label htmlFor="vendor_notification" className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Vendor Network
                        </Label>
                    </div> */}
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <Button
                    onClick={onSend}
                    className="flex-1"
                    disabled={!message.title || !message.content || message.channels.length === 0}
                >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                    Save as Template
                </Button>
            </div>
        </div>
    )
}

function MessageDetails({ message }: { message: any }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <h3 className="font-medium">Message Information</h3>
                    <div className="space-y-1 text-sm">
                        <p>
                            <span className="font-medium">Title:</span> {message.title}
                        </p>
                        <p>
                            <span className="font-medium">Type:</span> {message.type}
                        </p>
                        <p>
                            <span className="font-medium">Recipients:</span> {message.recipients} ({message.recipientCount})
                        </p>
                        <p>
                            <span className="font-medium">Sent At:</span> {new Date(message.sentAt).toLocaleString()}
                        </p>
                        <p>
                            <span className="font-medium">Created By:</span> {message.createdBy}
                        </p>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="font-medium">Delivery Analytics</h3>
                    <div className="space-y-1 text-sm">
                        <p>
                            <span className="font-medium">Status:</span> {message.status}
                        </p>
                        <p>
                            <span className="font-medium">Delivery Rate:</span> {message.deliveryRate}%
                        </p>
                        <p>
                            <span className="font-medium">Read Rate:</span> {message.readRate}%
                        </p>
                        <p>
                            <span className="font-medium">Channels:</span> {message.channels.join(", ")}
                        </p>
                        {message.failureReason && (
                            <p>
                                <span className="font-medium text-destructive">Failure Reason:</span> {message.failureReason}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="font-medium">Message Content</h3>
                <div className="p-3 bg-muted rounded border">
                    <p className="text-sm">{message.content}</p>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="font-medium">Channel Performance</h3>
                <div className="grid gap-2 md:grid-cols-2">
                    {message.channels.map((channel: string) => {
                        const ChannelIcon = getChannelIcon(channel)
                        return (
                            <div key={channel} className="flex items-center justify-between p-2 border border-border rounded">
                                <div className="flex items-center gap-2">
                                    <ChannelIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{channel.replace("_", " ")}</span>
                                </div>
                                <Badge variant="outline">{Math.floor(Math.random() * 10) + 90}% delivered</Badge>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function getChannelIcon(channel: string) {
    switch (channel) {
        case "sms":
            return MessageCircle
        case "ussd":
            return Phone
        case "voice_bot":
            return Volume2
        case "in_app":
            return MessageSquare
        case "vendor_notification":
            return Building2
        default:
            return Mail
    }
}
